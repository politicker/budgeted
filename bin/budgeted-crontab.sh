#/bin/bash

date=$(date +%Y-%m-%d)

path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "The script is located in: $path"

echo "----- [$date] ETL: start -----" >> budgeted-cron-log.log
$path/budgeted-cli load plaid-data >> budgeted-cron-log.log
$path/budgeted-cli load csv >> budgeted-cron-log.log
$path/budgeted-cli load sqlite >> budgeted-cron-log.log

echo "----- [$date] ETL: complete -----" >> budgeted-cron-log.log
