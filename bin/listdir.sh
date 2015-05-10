#!/bin/bash
find $1 -type f | sort -k2 | awk '{printf "\"%s\",\n", $0}'