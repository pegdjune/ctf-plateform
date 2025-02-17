#!/bin/bash
# Installation du kernel vulnérable
wget https://security.ubuntu.com/ubuntu/pool/main/l/linux/linux-image-5.15.0-25-generic_5.15.0-25.25_amd64.deb
dpkg -i linux-image-5.15.0-25-generic_5.15.0-25.25_amd64.deb
update-grub