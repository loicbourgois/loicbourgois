# Movie Finder


## Local
```sh
# Frontend
$HOME/github.com/loicbourgois/loicbourgois/go.sh
open https://localhost/movie-finder/

# Backend for movie_finder
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/api/local.sh
    curl -k https://localhost:3000/about
    open https://localhost:3000/about
    open https://localhost/movie-finder/
    curl -k https://localhost:3000/get/Q24871
```


## Staging
```sh
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/api/admin.sh
    screen -DR movie_finder_staging_api
        $HOME/github.com/loicbourgois/loicbourgois/movie-finder/api/staging.sh
curl -k https://api.loicbourgois.com:3000/about
open https://api.loicbourgois.com:3000/about
open https://loicbourgois.com/movie-finder
```


## WIP
```sh
- add random movie service
- update frontend to show list
- click on image triggers new search
- deploy
```
