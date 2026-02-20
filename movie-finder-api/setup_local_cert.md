```sh
cd $HOME/github.com/loicbourgois/loicbourgois
openssl req -x509 -nodes -newkey rsa:4096 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -days 365 \
  -subj "/C=US/ST=Local/L=Local/O=Dev/OU=Local/CN=localhost"
```
