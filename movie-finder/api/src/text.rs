use std::collections::HashSet;

pub fn normalize(s: &str) -> String {
    s.to_lowercase().trim().to_string()
}

pub fn generate_trigrams(s: &str) -> HashSet<String> {
    let mut trigrams = HashSet::new();
    if s.is_empty() {
        return trigrams;
    }
    // Pad the string with two spaces at the start and end to capture
    // trigrams involving the beginning and end of the word (e.g., "  a", " ab", "abc", "bc ", "c  ")
    let padded_s = format!("  {s}  ");
    let chars: Vec<char> = padded_s.chars().collect();
    for i in 0..=chars.len() - 3 {
        let trigram_str: String = chars[i..i + 3].iter().collect();
        trigrams.insert(trigram_str);
    }
    trigrams
}
