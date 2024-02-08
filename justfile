check-notary:
    spctl -a -vvv -t install dist/mac-arm64/budgeted.app

etl:
    ./bin/budgeted-cli extract
    ./bin/budgeted-cli transform
    ./bin/budgeted-cli load
