# Movie Finder


## Local
```sh
# Frontend
$HOME/github.com/loicbourgois/loicbourgois/dev.sh
open https://localhost/movie-finder/

# Backend for movie_finder
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/api/build.sh
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
        cd $HOME/github.com/loicbourgois/loicbourgois
        git fetch --all
        git pull
        $HOME/github.com/loicbourgois/loicbourgois/movie-finder/api/staging.sh
curl -k https://api.loicbourgois.com:3000/about
open https://api.loicbourgois.com:3000/about
open https://loicbourgois.com/movie-finder
```


## Check certificate
```sh
$HOME/github.com/loicbourgois/loicbourgois/movie-finder/api/admin.sh
    end_date=$(openssl x509 -in $HOME/github.com/loicbourgois/loicbourgois/fullchain.pem -noout -enddate | cut -d= -f2)
    echo "Certificate expires on: $end_date"
    days_left=$(( ( $(date -d "$end_date" +%s) - $(date +%s) ) / 86400 ))
    echo "Days left: $days_left"
```
