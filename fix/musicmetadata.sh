#!/bin/sh

echo "Patching musicmetadata"

# Patch the source code
patch -N -t -p1 -i ../../fix/musicmetadata.patch -d node_modules/musicmetadata/
# If patch was applied, do this
if [ $? -eq 0 ]; then
    # Pull in new dependencies
    npm install is-stream --prefix node_modules/musicmetadata/
    npm install component-props --prefix node_modules/musicmetadata
fi
