#!/bin/bash
outPath='/home/arthur/scraperOut'
binPath='/home/arthur/workspace/autoemail'
phantomjs /home/arthur/workspace/autoemail/scrapeTimes.js netball > "${outPath}/scraper_$(date +'%m%d%y').log"
nm=$(cat ${outPath}/nextMatch.txt)
emails=$(cat ${binPath}/netballEmails.txt)
#emails=$(cat ${binPath}/emails.test)
echo ${emails} > "${outPath}/sh_$(date +'%m%d%y').log"
echo $nm | mail -s "$nm" --append=FROM:"Weekly Netball Reminder <arthurc@centrumsystems.com.au>" $emails
