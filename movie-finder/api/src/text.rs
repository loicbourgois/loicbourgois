use std::collections::HashSet;

pub fn normalize(s: &str) -> String {
    s.to_lowercase().trim().to_string()
}

pub fn generate_trigrams(s: &str) -> HashSet<String> {
    let min = 3;
    let max = 3;
    let mut trigrams = HashSet::new();
    if s.is_empty() {
        return trigrams;
    }
    for count in min..=max {
        let mut padded_s = s.to_string();
        for _ in 0..count {
            padded_s = format!(" {padded_s} ");
        }
        let chars: Vec<char> = padded_s.chars().collect();
        for i in 0..=chars.len() - count {
            let trigram_str: String = chars[i..i + count].iter().collect();
            trigrams.insert(trigram_str);
        }
    }
    trigrams
}
