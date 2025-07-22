ssh-keygen -t rsa -m PEM -f ./keys/teste-tool -P "aaaaa"

openssl rsa -in ./keys/teste-tool -pubout -out ./keys/teste-tool.pem.pub -passin pass:aaaaa

openssl pkcs8 -topk8 \
-inform PEM \
-outform PEM \
-in ./keys/teste-tool \
-out ./keys/teste-tool.pk8 \
-nocrypt \
-passin pass:aaaaa