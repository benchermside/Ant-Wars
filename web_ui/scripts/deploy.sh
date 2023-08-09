#! /bin/sh

# Delete existing things
rm -r deploy/*

# Copy into a deploy dir
mkdir -p deploy
cp index.html deploy
cp favicon.ico deploy
cp icon.png deploy
cp tile.png deploy
cp tile-wide.png deploy
mkdir -p deploy/css
cp -r css/* deploy/css
mkdir -p deploy/config
cp -r config/* deploy/config
mkdir -p deploy/js
cp -r js/* deploy/js

# Move to AWS
#
# Use of the "--size-only" argument here prevents us from uploading the
# entire site each time. But it CAN give errors if a file is modified
# but keeps the same size. If this might be a concern, run it once
# without that argument.
aws s3 sync ./deploy s3://ant-war.com --size-only --profile power-user --region us-east-1

# Controlling cloudfront from the command line is still in beta, so we
# have to explicitly enable it.
aws configure set preview.cloudfront true --profile power-user

# Tell cloudwatch to invalidate all the files. The "distribution" is
# hard-coded into this command. Also uses a backspace to escape the asterix.
aws cloudfront create-invalidation --distribution-id E1XVSOWOMUFY8O --paths /\* --profile power-user
