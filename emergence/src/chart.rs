const DEATH_CHART_WIDTH: usize = 220;
const DEATH_CHART_HEIGHT: usize = 19;

fn death_chart_y(deaths: usize, max_deaths: usize) -> usize {
    if max_deaths == 0 {
        DEATH_CHART_HEIGHT - 1
    } else {
        let scaled = (deaths as f32 / max_deaths as f32) * (DEATH_CHART_HEIGHT - 1) as f32;
        DEATH_CHART_HEIGHT - 1 - scaled.round() as usize
    }
}

fn chart_y_f32(value: f32, max_value: f32) -> usize {
    if max_value <= 0.0 {
        DEATH_CHART_HEIGHT - 1
    } else {
        let scaled = (value / max_value) * (DEATH_CHART_HEIGHT - 1) as f32;
        DEATH_CHART_HEIGHT - 1 - scaled.round() as usize
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

    let mut grid = vec![vec![' '; bucket_count]; DEATH_CHART_HEIGHT];

    for (x, (min_value, max_bucket_value)) in buckets.iter().enumerate() {
        let min_y = chart_y_f32(*min_value, max_value);
        let max_y = chart_y_f32(*max_bucket_value, max_value);

        for row in max_y..=min_y {
            grid[row][x] = '█';
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value = max_value * (DEATH_CHART_HEIGHT - 1 - row_index) as f32
            / (DEATH_CHART_HEIGHT - 1) as f32;

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

    let mut grid = vec![vec![' '; bucket_count]; DEATH_CHART_HEIGHT];

    for (x, (min_value, max_bucket_value)) in buckets.iter().enumerate() {
        let min_y = death_chart_y(*min_value, max_value);
        let max_y = death_chart_y(*max_bucket_value, max_value);

        for row in max_y..=min_y {
            grid[row][x] = '█';
        }
    }

    for (row_index, row) in grid.iter().enumerate() {
        let value = max_value as f32 * (DEATH_CHART_HEIGHT - 1 - row_index) as f32
            / (DEATH_CHART_HEIGHT - 1) as f32;

        println!("{:>8.0} │{}", value, row.iter().collect::<String>());
    }

    println!("         └{}", "─".repeat(bucket_count));
    println!(
        "          0{}{}",
        " ".repeat(bucket_count.saturating_sub(2)),
        history.len().saturating_sub(1)
    );
}
