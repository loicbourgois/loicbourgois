```sh
curl https://api.loicbourgois.com:3000/about
  # curl: (60) SSL certificate problem: self signed certificate

$HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/superadmin.sh
  certbot certonly --standalone --preferred-challenges http -d api.loicbourgois.com
  user=__
  cp /etc/letsencrypt/live/api.loicbourgois.com/privkey.pem /home/$user/github.com/loicbourgois/loicbourgois/privkey.pem
  cp /etc/letsencrypt/live/api.loicbourgois.com/fullchain.pem /home/$user/github.com/loicbourgois/loicbourgois/fullchain.pem
  chown $user /home/$user/github.com/loicbourgois/loicbourgois/privkey.pem
  chown $user /home/$user/github.com/loicbourgois/loicbourgois/fullchain.pem

$HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/admin.sh
    screen -DR movie_finder_staging
        $HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/staging.sh
```
