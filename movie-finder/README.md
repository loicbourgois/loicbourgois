# Movie Finder


## Local
```sh
# Frontend
$HOME/github.com/loicbourgois/loicbourgois/go.sh
open http://localhost/movie-finder/

# Backend for movie_finder
$HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/local.sh
    curl -k https://localhost:3000/about
    open https://localhost:3000/about
    open https://localhost/movie-finder/
```


## Staging
```sh
$HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/admin.sh
    screen -DR movie_finder_staging
        cat /etc/letsencrypt/live/api.loicbourgois.com/fullchain.pem
        $HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/staging.sh
curl -k https://api.loicbourgois.com:3000/about
open https://api.loicbourgois.com:3000/about
open https://loicbourgois.com/movie-finder
```
