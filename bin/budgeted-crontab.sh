#/bin/sh

date=$(date +%Y-%m-%d)

echo "----- [$date] ETL: start -----" >> budgeted-cron-log.log

bin/budgeted-cli load plaid-data >> budgeted-cron-log.log
bin/budgeted-cli load csv >> budgeted-cron-log.log
bin/budgeted-cli load sqlite >> budgeted-cron-log.log

echo "----- [$date] ETL: complete -----" >> budgeted-cron-log.log
