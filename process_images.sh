#!/bin/bash

# Instructions to use the script:
# Give execute permissions to the script: chmod +x process_images.sh.
# Run the script: ./process_images.sh.

# Important Notes:
# Does not work on Windows.
# Ensure that you have the necessary permissions to read, write, and execute in the directories and with the files you are manipulating.
# This script does not handle edge cases like file name conflicts beyond the basic replacement. If you need more robust handling, additional checks and features can be added.

# Locate and iterate through all .diff.png files in DIFF_DIR.
# Open each image for preview and prompt the user to decide whether to set it as a new baseline.
# If the user says yes, the script will replace the existing baseline image with the updated image and delete the diff file.
# If the user says no, the script will move on to the next file.
# Continue this process until all files are assessed.

# Define directories
BASELINE_DIR="./cypress/snapshots/visual-regression.cy.ts/"
DIFF_DIR="./cypress/snapshots/visual-regression.cy.ts/__diff_output__/"


# Function to process each image
process_image() {
    local image_file=$1
    
    echo "Processing $image_file..."

    # Open image preview
    if [[ $(uname -s) == "Darwin" ]]; then
        echo "in darwin"
        # open image in preview but in the background, not taking focus:
        open -g "$DIFF_DIR$image_file"
    else
        echo "in linux"
        xdg-open "$DIFF_DIR$image_file"
    fi

    # Prompt user to decide whether to set the image as a new baseline by pressing enter to confirm and 
    # any other key to skip to the next image
    read -n 1 -p "Press enter to set as new baseline or any other key to skip to the next image..." answer

    # Close image preview
    if (uname -s == "Darwin"); then
        # close the image preview:
        osascript -e 'quit app "Preview"'
    else
        pkill -f "$DIFF_DIR$image_file"
    fi


    if [[ $answer == "" ]]; then
        # Find the corresponding file - if it exists - in the updated directory (same file name but with .updated. instead of .diff.):
        local image_name="${image_file//.diff.png/}"

        local baseline_name="$image_name.snap.png"
        local diff_name="$image_name.diff.png"
        local updated_name="$image_name.updated.png"

        if [[ -f "$BASELINE_DIR$baseline_name" ]]; then
            # Delete the existing file in baseline
            echo "Deleting $baseline_name"
            rm "$baseline_name"

            # Rename the updated file
            echo "Renaming $BASELINE_DIR$updated_name to $BASELINE_DIR$baseline_name"
            mv "$BASELINE_DIR$updated_name" "$BASELINE_DIR$baseline_name"

            # Delete the diff file
            echo "Deleting $DIFF_DIR$image_file"
            rm "$DIFF_DIR$image_file"
        fi
    fi
}

# Main loop to process images
for file in "$DIFF_DIR"*.diff.png; do
    # Check if there are no matching files
    if [[ ! -e $file ]]; then
        echo "No diffing images found."
        break
    fi

    echo "Found $file"

    # Process each image
    process_image "$(basename "$file")"
done

echo "All images processed."
