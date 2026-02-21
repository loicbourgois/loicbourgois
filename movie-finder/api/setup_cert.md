```sh
cd $HOME/github.com/loicbourgois/loicbourgois
# openssl genrsa -out key.pem 2048
# openssl req -new -x509 -key key.pem -out cert.pem -days 365 \
#     -subj "/C=US/ST=Local/L=Dev/O=Dev/OU=LocalDev/CN=localhost"
openssl req -x509 -nodes -newkey rsa:4096 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -days 365 \
  -subj "/C=US/ST=Local/L=Local/O=Dev/OU=Local/CN=localhost"
```
