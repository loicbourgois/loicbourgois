use serde::Serialize;
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
#[derive(Serialize)]
pub struct Argument {
    name: String,
    r#type: String,
}
type CallArguments = Vec<Node>;
type Arguments = Vec<Argument>;
#[derive(Serialize)]
pub struct Function {
    name: String,
    arguments: Arguments,
    nodes: Nodes,
}
#[derive(Serialize)]
pub struct FunctionCall {
    name: String,
    arguments: CallArguments,
}
#[derive(Serialize)]
pub struct Use {
    name: String,
}
#[derive(Serialize)]
pub struct StdCallPrintln {
    name: String,
    arguments: CallArguments,
}
#[derive(Serialize)]
pub struct StdCallLog {
    arguments: CallArguments,
}
#[derive(Serialize)]
pub struct Line {
    line: String,
}
#[derive(Serialize)]
pub struct StdCallRandom {}
type Nodes = Vec<Node>;
#[derive(Serialize)]
pub struct Program {
    pub nodes: Nodes,
}
#[derive(Serialize)]
pub struct CallArgument {
    pub c: String,
}
#[derive(Serialize)]
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
        println!("'{}'", str_);
        if str_.is_empty() {
            return Ok(Node::Empty);
        }
        let mut depth = 0;
        let mut open_parenthese = None;
        let mut close_parenthese = None;
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
        let args: CallArguments = args_str
            .split(',')
            .map(Node::from_str)
            .filter(std::result::Result::is_ok)
            .map(std::result::Result::unwrap)
            .collect();
        let name = match prename {
            "std.println" => {
                return Ok(Node::StdCallPrintln(StdCallPrintln {
                    name: "println!".to_string(),
                    arguments: args,
                }))
            }
            "std.log" => return Ok(Node::StdCallLog(StdCallLog { arguments: args })),
            "std.random" => return Ok(Node::StdCallRandom(StdCallRandom {})),
            x => x,
        };
        Ok(Node::FunctionCall(FunctionCall {
            name: name.to_string(),
            arguments: args,
        }))
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
    pub fn to_rust(&self) -> String {
        match self {
            Node::Program(x) => x.nodes.iter().map(Node::to_rust).collect::<String>(),
            Node::Function(x) => {
                format!(
                    "fn {}({}){{ {} }}",
                    x.name,
                    x.arguments
                        .iter()
                        .map(|x| format!("{}:{}", x.name, x.r#type))
                        .collect::<Vec<String>>()
                        .join(","),
                    x.nodes
                        .iter()
                        .map(Node::to_rust)
                        .collect::<Vec<String>>()
                        .join(";")
                        + ";"
                )
            }
            Node::StdCallPrintln(x) => {
                format!(
                    "{}(\"{}\", {})",
                    x.name,
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
                format!(
                    "{}({})",
                    x.name,
                    x.arguments
                        .iter()
                        .map(Node::to_rust)
                        .collect::<Vec<String>>()
                        .join(",")
                )
            }
            Node::Use(x) => {
                format!("use {};", x.name)
            }
            Node::StdCallRandom(_) => "rng.gen::<f32>()".to_string(),
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
    program.program().nodes.push(Node::Use(Use {
        name: "chrono::Utc".to_string(),
    }));
    program.program().nodes.push(Node::Use(Use {
        name: "rand::Rng".to_string(),
    }));
    program.program().nodes.push(Node::Function(Function {
        name: "main".to_string(),
        arguments: Vec::new(),
        nodes: Vec::new(),
    }));
    let main_function_idx = program.program().nodes.len() - 1;
    program.program().nodes.push(Node::Function(Function {
        name: "log".to_string(),
        arguments: vec![Argument {
            name: "s".to_string(),
            r#type: "&str".to_string(),
        }],
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
    let main_function: &mut Function = program.program().nodes[main_function_idx].function();
    main_function.nodes.push(Node::Line(Line {
        line: "let mut rng = rand::thread_rng();".to_string(),
    }));
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
                        Node::FunctionCall(x) => main_function.nodes.push(Node::FunctionCall(x)),
                        Node::StdCallPrintln(x) => {
                            main_function.nodes.push(Node::StdCallPrintln(x));
                        }
                        Node::StdCallLog(x) => main_function.nodes.push(Node::StdCallLog(x)),
                        _ => todo!(),
                    }
                    start = pos;
                }
            }
            '(' => {
                depth += 1;
            }
            ')' => {
                depth -= 1;
            }
            _ => {}
        }
    }
    println!("\n# Tree");
    println!("{}", serde_json::to_string_pretty(&program).unwrap());
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
