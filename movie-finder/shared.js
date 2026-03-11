const triggerSearch = () => {
    const query = document.querySelector('#top input').value.trim();
    if (query) {
        window.location.href = `/movie-finder/search/${encodeURIComponent(query)}`;
    }
}

 
const setup_events = () => {
    document.querySelector('#button_search').addEventListener('click', triggerSearch);
    document.querySelector('#button_random').addEventListener('click', () => {
        window.location.href = `/movie-finder`;
    });
    document.querySelector('#top input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            triggerSearch();
        }
    });
}


export {
    setup_events,
}