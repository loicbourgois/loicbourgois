use serde::Serialize;
use std::collections::HashSet;
use std::env;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::str::FromStr;
fn read(path: &String) -> String {
    fs::read_to_string(path).unwrap_or_else(|_| panic!("Could not read file={}", path))
}
fn write(path: &String, content: &String) {
    let splt: Vec<String> = path
        .split('/')
        .map(std::string::ToString::to_string)
        .collect();
    let splt_: Vec<String> = splt[0..splt.len() - 1].to_vec();
    let parent_path = splt_.join("/");
    fs::create_dir_all(parent_path).unwrap();
    let mut file = File::create(path).unwrap();
    writeln!(&mut file, "{}", content).unwrap();
}
#[derive(Serialize, Debug)]
pub struct Argument {
    name: String,
    r#type: String,
}
type ReturnType = Option<String>;
type CallArguments = Vec<Node>;
type Arguments = Vec<Argument>;
#[derive(Serialize, Debug)]
pub struct Function {
    name: String,
    arguments: Arguments,
    nodes: Nodes,
    return_type: ReturnType,
}
#[derive(Serialize, Debug)]
pub struct FunctionCall {
    name: String,
    arguments: CallArguments,
}
#[derive(Serialize, Debug)]
pub struct Use {
    name: String,
}
#[derive(Serialize, Debug)]
pub struct StdCallPrintln {
    name: String,
    arguments: CallArguments,
}
#[derive(Serialize, Debug)]
pub struct StdCallLog {
    name: String,
    arguments: CallArguments,
}
#[derive(Serialize, Debug)]
pub struct Line {
    line: String,
}
#[derive(Serialize, Debug)]
pub struct StdCallRandom {}
type Nodes = Vec<Node>;
#[derive(Serialize, Debug)]
pub struct Program {
    pub nodes: Nodes,
}
#[derive(Serialize, Debug)]
pub struct CallArgument {
    pub c: String,
}
#[derive(Serialize, Debug)]
pub enum Node {
    Function(Function),
    Program(Program),
    FunctionCall(FunctionCall),
    StdCallPrintln(StdCallPrintln),
    StdCallLog(StdCallLog),
    StdCallRandom(StdCallRandom),
    Use(Use),
    Line(Line),
    CallArgument(CallArgument),
    Empty,
}
impl std::str::FromStr for Node {
    type Err = std::string::ParseError;
    fn from_str(str_: &str) -> std::result::Result<Node, Self::Err> {
        if str_.is_empty() {
            return Ok(Node::Empty);
        }
        let mut depth = 0;
        let mut open_parenthese = None;
        let mut close_parenthese = None;
        let mut open_bracket = None;
        let mut close_bracket = None;
        for (i, c) in str_.chars().enumerate() {
            match c {
                '(' => {
                    if depth == 0 && open_parenthese == None {
                        open_parenthese = Some(i);
                    }
                    depth += 1;
                }
                ')' => {
                    depth -= 1;
                    if depth == 0 && open_parenthese.is_some() && close_parenthese == None {
                        close_parenthese = Some(i);
                    }
                }
                '{' => {
                    if depth == 0 && open_bracket == None {
                        open_bracket = Some(i);
                    }
                    depth += 1;
                }
                '}' => {
                    depth -= 1;
                    if depth == 0 && open_bracket.is_some() && close_bracket == None {
                        close_bracket = Some(i);
                    }
                }
                _ => {}
            }
        }
        let mut prename = str_;
        let mut args_str = "";
        if open_parenthese.is_some() {
            prename = &str_[0..open_parenthese.unwrap()];
        }
        if close_parenthese.is_some() {
            args_str = &str_[open_parenthese.unwrap() + 1..close_parenthese.unwrap()];
        }
        if open_bracket.is_some() && close_bracket.is_some() {
            let body_str = &str_[open_bracket.unwrap() + 1..close_bracket.unwrap()];
            let mut nodes = Vec::new();
            let mut start = 0;
            let mut pos = 0;
            let mut depth = 0;
            for c in body_str.chars() {
                pos += 1;
                match c {
                    '\n' => {
                        if depth == 0 {
                            let str_ = &body_str[start..pos];
                            if let Ok(n) = Node::from_str(str_.trim()) {
                                nodes.push(n);
                            }
                            start = pos;
                        }
                    }
                    '(' | '{' => {
                        depth += 1;
                    }
                    ')' | '}' => {
                        depth -= 1;
                    }
                    _ => {}
                }
            }
            let arguments = args_str
                .split('\n')
                .filter(|x| !x.trim().is_empty())
                .map(|arg| {
                    let tn: Vec<&str> = arg.split(':').collect();
                    Argument {
                        name: tn[0].trim().to_string(),
                        r#type: tn[1].trim().to_string(),
                    }
                })
                .collect();
            let return_type_str = &str_[close_parenthese.unwrap() + 1..open_bracket.unwrap()];
            let return_type = match return_type_str.trim().len() {
                0 => None,
                _ => Some(return_type_str.trim().to_string()),
            };
            return Ok(Node::Function(Function {
                name: prename.trim().to_string(),
                arguments,
                nodes,
                return_type,
            }));
        }

        println!("#### {}", args_str.replace('\n', "").trim());

        // let args: CallArguments = args_str
        //     .split(',')
        //     .map(Node::from_str)
        //     .filter(std::result::Result::is_ok)
        //     .map(std::result::Result::unwrap)
        //     .collect();

        // let args = Node::from_str(args_str).unwrap();

        let mut args = Vec::new();
        {
            let mut start = 0;
            let mut pos = 0;
            let mut depth = 0;
            for (i, c) in args_str.chars().enumerate() {
                pos += 1;
                match c {
                    '\n' => {
                        if depth == 0 {
                            let str_ = &args_str[start..pos - 1].trim();
                            if !str_.is_empty() {
                                if let Ok(n) = Node::from_str(str_) {
                                    args.push(n);
                                }
                            }
                            start = pos;
                        }
                    }
                    '(' => {
                        depth += 1;
                    }
                    ')' => {
                        depth -= 1;
                        if i == args_str.len() - 1 {
                            let str_ = &args_str[start..pos].trim();
                            if !str_.is_empty() {
                                if let Ok(n) = Node::from_str(str_) {
                                    args.push(n);
                                }
                            }
                            // start = pos;
                        }
                    }
                    _ => {
                        if i == args_str.len() - 1 {
                            let str_ = &args_str[start..pos].trim();
                            if !str_.is_empty() {
                                if let Ok(n) = Node::from_str(str_) {
                                    args.push(n);
                                }
                            }
                            // start = pos;
                        }
                    }
                }
            }
        }

        let name = match prename {
            "std.println" => {
                return Ok(Node::StdCallPrintln(StdCallPrintln {
                    name: "std.println".to_string(),
                    arguments: args,
                }))
            }
            "std.log" => {
                return Ok(Node::StdCallLog(StdCallLog {
                    name: "std.log".to_string(),
                    arguments: args,
                }))
            }
            "std.random" => return Ok(Node::StdCallRandom(StdCallRandom {})),
            x => x.trim(),
        };
        if open_parenthese.is_some() {
            Ok(Node::FunctionCall(FunctionCall {
                name: name.to_string(),
                arguments: args,
            }))
        } else {
            Ok(Node::CallArgument(CallArgument {
                c: name.to_string(),
            }))
        }
    }
}
impl Program {
    pub fn main_function(&mut self) -> &mut Function {
        for n in &mut self.nodes {
            if let Node::Function(x) = n {
                if x.name == "main" {
                    return x;
                }
            }
        }
        panic!("No main Function")
    }
}
impl Node {
    pub fn function(&mut self) -> &mut Function {
        if let Node::Function(x) = self {
            x
        } else {
            panic!("Not a Function")
        }
    }
    pub fn program(&mut self) -> &mut Program {
        if let Node::Program(x) = self {
            x
        } else {
            panic!("Not a Program")
        }
    }
    pub fn list_function_calls(&self) -> HashSet<String> {
        match self {
            Node::Program(x) => {
                let mut h = HashSet::new();
                for n in &x.nodes {
                    h.extend(n.list_function_calls());
                }
                h
            }
            Node::StdCallPrintln(x) => {
                let mut h = HashSet::new();
                h.insert(x.name.clone());
                for n in &x.arguments {
                    h.extend(n.list_function_calls());
                }
                h
            }
            Node::StdCallLog(x) => {
                let mut h = HashSet::new();
                h.insert(x.name.clone());
                for n in &x.arguments {
                    h.extend(n.list_function_calls());
                }
                h
            }
            Node::Function(x) => {
                let mut h = HashSet::new();
                for n in &x.nodes {
                    h.extend(n.list_function_calls());
                }
                h
            }
            Node::StdCallRandom(_) => {
                let mut h = HashSet::new();
                h.insert("std.random".to_string());
                h
            }
            Node::FunctionCall(x) => {
                let mut h = HashSet::new();
                for n in &x.arguments {
                    h.extend(n.list_function_calls());
                }
                h
            }
            _ => HashSet::new(),
        }
    }
    pub fn to_rust(&self) -> String {
        match self {
            Node::Program(x) => x.nodes.iter().map(Node::to_rust).collect::<String>(),
            Node::Function(x) => {
                let return_type = match &x.return_type {
                    None => "".to_string(),
                    Some(x) => format!(" -> {} ", x),
                };
                let args = if x.arguments.is_empty() {
                    "".to_string()
                } else {
                    format!("x:&{}_input", x.name)
                };
                let args_struct = if x.arguments.is_empty() {
                    "".to_string()
                } else {
                    format!(
                        "struct {}_input {{ {} }}",
                        x.name,
                        x.arguments
                            .iter()
                            .map(|x| format!("{}:{}", x.name, x.r#type))
                            .collect::<Vec<String>>()
                            .join(",")
                    )
                };
                let mut body = x
                    .nodes
                    .iter()
                    .filter(|x| !matches!(x, Node::Empty))
                    .map(Node::to_rust)
                    .collect::<Vec<String>>()
                    .join(";")
                    + ";";

                if !x.nodes.is_empty() {
                    body = "return ".to_owned() + &body;
                }

                // println!("{:?}", x.arguments);

                for x in &x.arguments {
                    let aa = format!("x.{}", x.name);
                    body = body.replace(&x.name, &aa);
                }

                format!(
                    "{} fn {}({}) {} {{ {} }}",
                    args_struct, x.name, args, return_type, body,
                )
            }
            Node::StdCallPrintln(x) => {
                format!(
                    "println!(\"{}\", {})",
                    x.arguments
                        .iter()
                        .map(|_| "{}".to_string())
                        .collect::<Vec<String>>()
                        .join(" "),
                    x.arguments
                        .iter()
                        .map(Node::to_rust)
                        .collect::<Vec<String>>()
                        .join(",")
                )
            }
            Node::StdCallLog(x) => {
                format!(
                    "log(&format!(\"{}\", {}))",
                    x.arguments
                        .iter()
                        .map(|_| "{}".to_string())
                        .collect::<Vec<String>>()
                        .join(" "),
                    x.arguments
                        .iter()
                        .map(Node::to_rust)
                        .collect::<Vec<String>>()
                        .join(",")
                )
            }
            Node::FunctionCall(x) => {
                let args = if x.arguments.is_empty() {
                    "".to_string()
                } else {
                    format!(
                        "& {}_input{{ {} }}",
                        x.name,
                        x.arguments
                            .iter()
                            .map(|x| Node::to_rust(x).replace('=', ":"))
                            .collect::<Vec<String>>()
                            .join(",")
                    )
                };
                format!("{}( {} )", x.name, args,)
            }
            Node::Use(x) => {
                format!("use {};", x.name)
            }
            Node::StdCallRandom(_) => "std_random()".to_string(),
            Node::Line(x) => x.line.clone(),
            Node::CallArgument(x) => x.c.clone(),
            Node::Empty => "".to_string(),
        }
    }
}
fn transpile(program_str_: &str) -> String {
    let program_str = program_str_
        .split('\n')
        .map(|x| -> &str {
            if x.starts_with('#') {
                ""
            } else {
                x
            }
        })
        .filter(|x| !x.is_empty())
        .collect::<Vec<&str>>()
        .join("\n")
        + "\n";
    let mut program = Node::Program(Program { nodes: Vec::new() });
    let mut line_count = 1;
    let mut char_count = 0;
    let mut start = 0;
    let mut pos = 0;
    let mut depth = 0;
    println!("\n# Lines");
    for c in program_str.chars() {
        if char_count == 0 {
            print!("{} | ", line_count);
        }
        print!("{}", c);
        char_count += 1;
        pos += 1;
        match c {
            '\n' => {
                char_count = 0;
                line_count += 1;
                if depth == 0 {
                    match Node::from_str(&program_str[start..pos]).unwrap() {
                        Node::Function(x) => program.program().nodes.push(Node::Function(x)),
                        x => todo!("{:?}", x),
                    }
                    start = pos;
                }
            }
            '(' | '{' => {
                depth += 1;
            }
            ')' | '}' => {
                depth -= 1;
            }
            _ => {}
        }
    }
    println!("\n# Tree");
    println!("{}", serde_json::to_string_pretty(&program).unwrap());
    println!("\n# Function calls");
    let lfc = program.list_function_calls();
    if lfc.contains("std.log") {
        program.program().nodes.insert(
            0,
            Node::Use(Use {
                name: "chrono::Utc".to_string(),
            }),
        );
        program.program().nodes.push(Node::Function(Function {
            name: "log".to_string(),
            arguments: vec![Argument {
                name: "s".to_string(),
                r#type: "&str".to_string(),
            }],
            return_type: None,
            nodes: vec![Node::StdCallPrintln(StdCallPrintln {
                name: "println!".to_string(),
                arguments: vec![
                    Node::CallArgument(CallArgument {
                        c: "Utc::now()".to_string(),
                    }),
                    Node::CallArgument(CallArgument {
                        c: "\"|\"".to_string(),
                    }),
                    Node::CallArgument(CallArgument { c: "s".to_string() }),
                ],
            })],
        }));
    }
    if lfc.contains("std.random") {
        program.program().nodes.insert(
            0,
            Node::Use(Use {
                name: "rand::Rng".to_string(),
            }),
        );
        program.program().nodes.insert(
            1,
            Node::Function(Function {
                name: "std_random".to_string(),
                arguments: Vec::new(),
                nodes: vec![
                    Node::Line(Line {
                        line: "let mut rng = rand::thread_rng();".to_string(),
                    }),
                    Node::Line(Line {
                        line: "return rng.gen::<f32>()".to_string(),
                    }),
                ],
                return_type: Some("f32".to_string()),
            }),
        );
    }
    let lfc2 = program.list_function_calls();
    println!("{:?}", lfc);
    println!("{:?}", lfc2);
    println!("\n# Rust");
    let r = program.to_rust();
    println!("{}", r);
    r
}
fn main() {
    let args: Vec<String> = env::args().collect();
    let program_name = &args[1];
    let program_path = &args[2];
    let output_path = program_path.replace("main.dap", "");
    println!("# Transpiling {}", program_path);
    let cargo_toml_template_path =
        &"/Users/loicbourgois/github.com/loicbourgois/loicbourgois/dap/dap/src/Cargo.toml.template"
            .to_string();
    let cargo_toml = read(cargo_toml_template_path).replace("__NAME__", program_name);
    let cargo_toml_path = output_path.clone() + "Cargo.toml";
    write(&cargo_toml_path, &cargo_toml);
    let main_rust_path = output_path.clone() + "src/main.rs";
    let main_rust_content = transpile(&read(program_path));
    write(&main_rust_path, &main_rust_content);
    println!("# Transpiled at {}", output_path);
}
