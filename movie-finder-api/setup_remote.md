```sh
username=_
host=_
ssh-keygen -t ed25519 -C $username@$host
cat $HOME/.ssh/$username@$host.pub
$HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/superadmin.sh
    username=_
    adduser --disabled-password --gecos "" "$username"
    SSH_DIR="/home/$username/.ssh"
    mkdir -p "$SSH_DIR"
    chmod 700 "$SSH_DIR"
    vim $SSH_DIR/authorized_keys
    chmod 600 "$SSH_DIR/authorized_keys"
    chown -R "$username:$username" "$SSH_DIR"
    cat /etc/ssh/sshd_config | grep "Password"
    su $username
        cat $HOME/.ssh/authorized_keys
    systemctl restart ssh
$HOME/github.com/loicbourgois/loicbourgois/movie-finder-api/admin.sh
    mkdir -p $HOME/github.com/loicbourgois
    cd $HOME/github.com/loicbourgois
    git clone https://github.com/loicbourgois/loicbourgois.git
    cd $HOME/github.com/loicbourgois/loicbourgois
```
