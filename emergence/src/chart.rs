use crate::Action;
use crate::agent::agent_kind::AgentKind;
use std::collections::HashMap;

const DEATH_CHART_WIDTH: usize = 220;
const CHART_HEIGHT: usize = 26 * 2;
// █▓▒░▌▍
const CR: char = '▒'; // RuleBased
const CN1: char = '█'; // Neural1
const CN2: char = '▍'; // Neural2

const CA_EAT: char = 'E';
const CA_CHILL: char = 'z';
const CA_GIVE_FOOD: char = '+';
const CA_FIND_FOOD: char = 'F';
const CA_TAKE_FOOD: char = '-';
const CA_MEDITATE: char = 'm';

fn death_chart_y(deaths: usize, max_deaths: usize) -> usize {
    if max_deaths == 0 {
        CHART_HEIGHT - 1
    } else {
        let scaled = (deaths as f32 / max_deaths as f32) * (CHART_HEIGHT - 1) as f32;
        CHART_HEIGHT - 1 - scaled.round() as usize
    }
}

fn chart_y_f32(value: f32, max_value: f32) -> usize {
    if max_value <= 0.0 {
        CHART_HEIGHT - 1
    } else {
        let scaled = (value / max_value) * (CHART_HEIGHT - 1) as f32;
        CHART_HEIGHT - 1 - scaled.round() as usize
    }
}

pub fn print_chart_f32(history: &[f32], title: &str) {
    if history.is_empty() {
        println!("No metrics to display.");
        return;
    }

    let max_value = history
        .iter()
        .copied()
        .fold(0.0_f32, |max, value| max.max(value));

    println!("{title}");

    if max_value <= 0.0 {
        println!("No values recorded.");
        return;
    }

    let bucket_count = DEATH_CHART_WIDTH.min(history.len());
    let mut buckets = Vec::with_capacity(bucket_count);

    for bucket_index in 0..bucket_count {
        let start = bucket_index * history.len() / bucket_count;
        let end = ((bucket_index + 1) * history.len() / bucket_count).max(start + 1);
        let end = end.min(history.len());
        let bucket = &history[start..end];

        let bucket_min = bucket
            .iter()
            .copied()
            .fold(f32::INFINITY, |min, value| min.min(value));
        let bucket_max = bucket
            .iter()
            .copied()
            .fold(f32::NEG_INFINITY, |max, value| max.max(value));

        buckets.push((bucket_min, bucket_max));
    }

    let mut grid = vec![vec![' '; bucket_count]; CHART_HEIGHT];

    for (x, (min_value, max_bucket_value)) in buckets.iter().enumerate() {
        let min_y = chart_y_f32(*min_value, max_value);
        let max_y = chart_y_f32(*max_bucket_value, max_value);

        for row in max_y..=min_y {
            grid[row][x] = '█';
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value = max_value * (CHART_HEIGHT - 1 - row_index) as f32 / (CHART_HEIGHT - 1) as f32;

        println!("{:>8.2} │{}", value, row.iter().collect::<String>());
    }

    println!("         └{}", "─".repeat(bucket_count));
    println!(
        "          0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}

pub fn print_chart_usize(history: &[usize], title: &str) {
    if history.is_empty() {
        println!("No metrics to display.");
        return;
    }

    let max_value = history.iter().copied().max().unwrap_or(0);

    println!("{title}");

    if max_value == 0 {
        println!("No values recorded.");
        return;
    }

    let bucket_count = DEATH_CHART_WIDTH.min(history.len());
    let mut buckets = Vec::with_capacity(bucket_count);

    for bucket_index in 0..bucket_count {
        let start = bucket_index * history.len() / bucket_count;
        let end = ((bucket_index + 1) * history.len() / bucket_count).max(start + 1);
        let end = end.min(history.len());
        let bucket = &history[start..end];

        let bucket_min = bucket.iter().copied().min().unwrap_or(0);
        let bucket_max = bucket.iter().copied().max().unwrap_or(0);

        buckets.push((bucket_min, bucket_max));
    }

    let mut grid = vec![vec![' '; bucket_count]; CHART_HEIGHT];

    for (x, (min_value, max_bucket_value)) in buckets.iter().enumerate() {
        let min_y = death_chart_y(*min_value, max_value);
        let max_y = death_chart_y(*max_bucket_value, max_value);

        for row in max_y..=min_y {
            grid[row][x] = '█';
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value =
            max_value as f32 * (CHART_HEIGHT - 1 - row_index) as f32 / (CHART_HEIGHT - 1) as f32;

        println!("{:>8.0} │{}", value, row.iter().collect::<String>());
    }

    println!("         └{}", "─".repeat(bucket_count));
    println!(
        "          0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}

// Order, top to bottom
// -  RuleBased
// -  Neural2
// -  Neural1
pub fn print_agent_kind_chart(history: &[HashMap<AgentKind, usize>], title: &str) {
    if history.is_empty() {
        println!("No metrics to display.");
        return;
    }
    println!("{title}, n1={CN1}, n2={CN2}, rule={CR}\n");
    let bucket_count = DEATH_CHART_WIDTH.min(history.len());
    let mut buckets = Vec::with_capacity(bucket_count);

    for bucket_index in 0..bucket_count {
        let start = bucket_index * history.len() / bucket_count;
        let end = ((bucket_index + 1) * history.len() / bucket_count).max(start + 1);
        let end = end.min(history.len());
        let bucket = &history[start..end];

        let mut rule_based_total = 0;
        let mut neural1_total = 0;
        let mut neural2_total = 0;

        for metric in bucket {
            rule_based_total += metric.get(&AgentKind::RuleBased).copied().unwrap_or(0);
            neural1_total += metric.get(&AgentKind::Neural1).copied().unwrap_or(0);
            neural2_total += metric.get(&AgentKind::Neural2).copied().unwrap_or(0);
        }

        let bucket_len = bucket.len().max(1);
        buckets.push((
            rule_based_total / bucket_len,
            neural1_total / bucket_len,
            neural2_total / bucket_len,
        ));
    }

    let max_value = buckets
        .iter()
        .map(|(rule_based, neural1, neural2)| rule_based + neural1 + neural2)
        .max()
        .unwrap_or(0);

    if max_value == 0 {
        println!("No values recorded.");
        return;
    }

    let mut grid = vec![vec![' '; bucket_count]; CHART_HEIGHT];

    for (x, (rule_based, neural1, neural2)) in buckets.iter().enumerate() {
        let neural1_height =
            ((*neural1 as f32 / max_value as f32) * CHART_HEIGHT as f32).round() as usize;
        let neural2_height =
            ((*neural2 as f32 / max_value as f32) * CHART_HEIGHT as f32).round() as usize;
        let rule_based_height =
            ((*rule_based as f32 / max_value as f32) * CHART_HEIGHT as f32).round() as usize;

        let mut filled = 0;

        for _ in 0..neural1_height {
            if filled >= CHART_HEIGHT {
                break;
            }
            let row = CHART_HEIGHT - 1 - filled;
            grid[row][x] = CN1;
            filled += 1;
        }

        for _ in 0..neural2_height {
            if filled >= CHART_HEIGHT {
                break;
            }
            let row = CHART_HEIGHT - 1 - filled;
            grid[row][x] = CN2;
            filled += 1;
        }

        for _ in 0..rule_based_height {
            if filled >= CHART_HEIGHT {
                break;
            }
            let row = CHART_HEIGHT - 1 - filled;
            grid[row][x] = CR;
            filled += 1;
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value = max_value as f32 * (CHART_HEIGHT - row_index) as f32 / CHART_HEIGHT as f32;

        println!("{:>8.0} │{}", value, row.iter().collect::<String>());
    }

    println!("         └{}", "─".repeat(bucket_count));
    println!(
        "          0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}

// Order, top to bottom
// -  RuleBased
// -  Neural2
// -  Neural1
pub fn print_max_age_by_kind_chart(history: &[HashMap<AgentKind, usize>], title: &str) {
    if history.is_empty() {
        println!("No metrics to display for max age by kind.");
        return;
    }
    println!("{title}, n1={CN1}, n2={CN2}, rule={CR}\n");

    let bucket_count = DEATH_CHART_WIDTH.min(history.len());
    let mut buckets: Vec<HashMap<AgentKind, usize>> = Vec::with_capacity(bucket_count);

    for bucket_index in 0..bucket_count {
        let start = bucket_index * history.len() / bucket_count;
        let end = ((bucket_index + 1) * history.len() / bucket_count).max(start + 1);
        let end = end.min(history.len());
        let bucket_range = &history[start..end];

        let mut current_bucket_max_age_by_kind = HashMap::new();
        for metric_entry in bucket_range {
            for (kind, &age) in metric_entry {
                current_bucket_max_age_by_kind
                    .entry(*kind)
                    .and_modify(|current_max_age: &mut usize| {
                        *current_max_age = (*current_max_age).max(age)
                    })
                    .or_insert(age);
            }
        }
        buckets.push(current_bucket_max_age_by_kind);
    }

    if buckets
        .iter()
        .all(|map| map.values().copied().sum::<usize>() == 0)
    {
        println!("No max ages recorded.");
        return;
    }

    let mut grid = vec![vec![' '; bucket_count]; CHART_HEIGHT];

    for (x, bucket_map) in buckets.iter().enumerate() {
        let rule_based_max_age = bucket_map.get(&AgentKind::RuleBased).copied().unwrap_or(0);
        let neural1_max_age = bucket_map.get(&AgentKind::Neural1).copied().unwrap_or(0);
        let neural2_max_age = bucket_map.get(&AgentKind::Neural2).copied().unwrap_or(0); // Added Neural2
        let bucket_total_age = rule_based_max_age + neural1_max_age + neural2_max_age; // Updated total

        if bucket_total_age == 0 {
            continue;
        }

        // Calculate proportional heights, ensuring they sum up to CHART_HEIGHT
        let mut filled_height = 0;

        // Draw Neural1 first (bottom-most)
        let neural1_height = ((neural1_max_age as f32 / bucket_total_age as f32)
            * CHART_HEIGHT as f32)
            .round() as usize;
        for _ in 0..neural1_height {
            if filled_height >= CHART_HEIGHT {
                break;
            }
            let row = CHART_HEIGHT - 1 - filled_height;
            grid[row][x] = CN1;
            filled_height += 1;
        }

        // Draw Neural2 next
        let neural2_height = ((neural2_max_age as f32 / bucket_total_age as f32)
            * CHART_HEIGHT as f32)
            .round() as usize;
        for _ in 0..neural2_height {
            if filled_height >= CHART_HEIGHT {
                break;
            }
            let row = CHART_HEIGHT - 1 - filled_height;
            grid[row][x] = CN2; // Using CN2
            filled_height += 1;
        }

        // RuleBased takes the remaining height (top-most)
        let rule_based_height = CHART_HEIGHT.saturating_sub(filled_height);
        for _ in 0..rule_based_height {
            if filled_height >= CHART_HEIGHT {
                break;
            }
            let row = CHART_HEIGHT - 1 - filled_height;
            grid[row][x] = CR;
            filled_height += 1;
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value = 100.0 * (CHART_HEIGHT - 1 - row_index) as f32 / (CHART_HEIGHT - 1) as f32;

        println!("{:>8.0} │{}", value, row.iter().collect::<String>());
    }

    println!("         └{}", "─".repeat(bucket_count));
    println!(
        "          0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}

fn action_chart_char(action: Action) -> char {
    match action {
        Action::FindFood => CA_FIND_FOOD,
        Action::GiveFood => CA_GIVE_FOOD,
        Action::TakeFood => CA_TAKE_FOOD,
        Action::Eat => CA_EAT,
        Action::Chill => CA_CHILL,
        Action::Meditate => CA_MEDITATE,
    }
}

fn action_chart_label(action: Action) -> &'static str {
    match action {
        Action::FindFood => "find_food",
        Action::GiveFood => "give_food",
        Action::TakeFood => "take_food",
        Action::Eat => "eat",
        Action::Chill => "chill",
        Action::Meditate => "meditate",
    }
}

pub fn print_actions_chart(history: &[HashMap<Action, usize>], actions: &[Action], title: &str) {
    if history.is_empty() {
        println!("No metrics to display.");
        return;
    }

    if actions.is_empty() {
        println!("No actions selected.");
        return;
    }

    let legend = actions
        .iter()
        .map(|action| {
            format!(
                "{}={}",
                action_chart_label(*action),
                action_chart_char(*action)
            )
        })
        .collect::<Vec<_>>()
        .join(", ");

    println!("{title}, {legend}\n");

    let bucket_count = DEATH_CHART_WIDTH.min(history.len());
    let mut buckets = Vec::with_capacity(bucket_count);

    for bucket_index in 0..bucket_count {
        let start = bucket_index * history.len() / bucket_count;
        let end = ((bucket_index + 1) * history.len() / bucket_count).max(start + 1);
        let end = end.min(history.len());
        let bucket = &history[start..end];

        let bucket_len = bucket.len().max(1);
        let mut action_counts = HashMap::new();

        for metric in bucket {
            for action in actions {
                *action_counts.entry(*action).or_insert(0) +=
                    metric.get(action).copied().unwrap_or(0);
            }
        }

        for count in action_counts.values_mut() {
            *count /= bucket_len;
        }

        buckets.push(action_counts);
    }

    let max_value = buckets
        .iter()
        .map(|bucket| {
            actions
                .iter()
                .map(|action| bucket.get(action).copied().unwrap_or(0))
                .sum::<usize>()
        })
        .max()
        .unwrap_or(0);

    if max_value == 0 {
        println!("No action counts recorded.");
        return;
    }

    let mut grid = vec![vec![' '; bucket_count]; CHART_HEIGHT];

    for (x, bucket) in buckets.iter().enumerate() {
        let mut filled = 0;

        for action in actions {
            let count = bucket.get(action).copied().unwrap_or(0);
            let height = ((count as f32 / max_value as f32) * CHART_HEIGHT as f32).round() as usize;

            for _ in 0..height {
                if filled >= CHART_HEIGHT {
                    break;
                }

                let row = CHART_HEIGHT - 1 - filled;
                grid[row][x] = action_chart_char(*action);
                filled += 1;
            }
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value = max_value as f32 * (CHART_HEIGHT - row_index) as f32 / CHART_HEIGHT as f32;

        println!("{:>8.0} │{}", value, row.iter().collect::<String>());
    }

    println!("         └{}", "─".repeat(bucket_count));
    println!(
        "          0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}
