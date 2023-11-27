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
# If the user accepts, the script will replace the existing baseline image with the updated image and delete the diff file.
# If the user rejects, the script will move on to the next file.
# Continue this process until all files are assessed.


printf "\e[36m\e[1m
 _  _  __  ____      ____  ____  ___ 
/ )( \(  )/ ___) ___(  _ \(  __)/ __)
\ \/ / )( \___ \(___))   / ) _)( (_ \ 
 \__/ (__)(____/    (__\_)(____)\___/
\e[0m\e[0m\n";


suite_target=0;
targets=()

while IFS= read -r -d '' target; do
    targets+=("$target")
done < <(find ./cypress/e2e -maxdepth 1 -type f -print0)

load_suite_target() {
    # Get a list of all files in ./cypress/e2e

    printf "Please select suite target:\n\n"

    # Printf all targets with a number for selection.
    for ((i=0; i<${#targets[@]}; i++)); do
        echo "$((i+1)). ${targets[$i]}"
    done

    # Read user input
    printf "\n"
    read -p "Enter the number of the suite you want to select: " suite_target_num

    # Decrement suite_target_num because bash arrays are 0-indexed
    suite_target_num=$((suite_target_num-1))

    # Store the selected file name 
    selected_target=${targets[$suite_target_num]}

    printf "\nSelected suite: $selected_target\n\n"

    suite_target=$suite_target_num
}


# Full suite
full_suite__id=1
full_suite__name="Full suite"
full_suite__slug="full-suite"
full_suite__description="Run the full suite of tests"

# Retest diffs
retest_diffs__id=2
retest_diffs__name="Retest diffs"
retest_diffs__slug="retest-diffs"
retest_diffs__description="Run the full suite of tests and retest diffs"

# Assess diffs
assess_diffs__id=3
assess_diffs__name="Assess diffs"
assess_diffs__slug="assess-diffs"
assess_diffs__description="Assess existing diffs"

test_type_num=0;

select_test_type() {
    test_types=("full_suite" "retest_diffs" "assess_diffs")

    printf "Please select test type:\n"

    # loop through the 3 test types and printf them with a number for selection.
    for ((i=0; i<${#test_types[@]}; i++)); do
        # Construct the name and description variable names
        name_var="${test_types[$i]}__name"
        desc_var="${test_types[$i]}__description"

        # Use indirect variable references to get the values
        name_val="${!name_var}"
        desc_val="${!desc_var}"

        echo "$((i+1)). $name_val - $desc_val"
    done

    # Read user input
    printf "\n"
    read -p "Enter the number of the type of test you want to run: " type_num

    # Decrement folder_num because bash arrays are 0-indexed
    type_num=$((type_num-1))

    # Store the selected test type name in a variable
    selected_test_type=${test_types[$type_num]}

    printf "\nSelected test type: $selected_test_type\n"

    # $type_num
    test_type_num=$type_num
}

load_suite_target
select_test_type;

printf "\nWill run:\n"

target_name="";

if [[ $suite_target == 0 ]]; then
    echo "On target: ${targets[0]}";
    target_name="${targets[0]}";
elif [[ $suite_target == 1 ]]; then
    echo "On target: ${targets[1]}";
    target_name="${targets[1]}";
elif [[ $suite_target == 2 ]]; then
    echo "On target: ${targets[2]}";
    target_name="${targets[2]}";
fi

test_type_slug="";

if [[ $test_type_num == 0 ]]; then
    echo "Test type: $full_suite__name";
    test_type_slug=$full_suite__slug;
elif [[ $test_type_num == 1 ]]; then
    echo "Test type: $retest_diffs__name";
    test_type_slug=$retest_diffs__slug;
elif [[ $test_type_num == 2 ]]; then
    echo "Test type: $assess_diffs__name";
    test_type_slug=$assess_diffs__slug;
fi

printf "\n\n";







clean_target_name="${target_name//.\/cypress\/e2e\//}";

BASELINE_DIR="./cypress/snapshots/$clean_target_name/";
DIFF_DIR="./cypress/snapshots/$clean_target_name/__diff_output__/";
DIFF_LIST_DIR="./cypress/support/";

remove_updated_snaps() {
    # Removes all updated snaps in the BASELINE_DIR if there are any
    if [ "$(ls -A $BASELINE_DIR*.updated.png)" ]; then
        rm "$BASELINE_DIR"*.updated.png;
    fi
}

remove_diff_list() {
    # Removes diff_list.txt file if it exists
    if [[ -f "$DIFF_LIST_DIR"diff_list.txt ]]; then
        rm "$DIFF_LIST_DIR"diff_list.txt;
    fi
}

remove_diffs() {
    # Removes all diffs in the DIFF_DIR if there are any
    if [ "$(ls -A $DIFF_DIR)" ]; then
        rm -r "$DIFF_DIR"/*;
    fi
}

create_list_of_diffs() {
    echo "Capturing complete screenshots of diffs";

    # loop through all the filenames in the DIFF_DIR and add them to the diff_list.txt file. But first, delete the contents of the diff_list.txt file. Also, if the diff_list.txt file does not exist, create it:
    touch "$DIFF_LIST_DIR"diff_list.txt;

    for file in "$DIFF_DIR"*.diff.png; do
        # Make a list of the filenames in the diff_list.txt file:
        echo "$(basename "$file")" >> "$DIFF_LIST_DIR"diff_list.txt;

        # show the user the list of filenames in the diff_list.txt file:
        echo "The following files are in the diff_list.txt file:";
        cat "$DIFF_LIST_DIR"diff_list.txt;

        # for each of the files, find the corresponding baseline image (with .span.png extension) and make a copy with the extension .original.png:
        # local image_name="${file//.diff.png/}";
        # local baseline_name="$image_name.snap.png";
        # local original_name="$image_name.original.png";
        # cp "$BASELINE_DIR$baseline_name" "$BASELINE_DIR$original_name";
    done

    # rm -r "$DIFF_DIR"/*;
    # # delete all files with the .updated.png extension in the BASELINE_DIR:
    # rm "$BASELINE_DIR"*.updated.png;
    # npx cypress run --spec cypress/e2e/production.cy.ts --env rerun_diffs=true;
}

assess_existing_diffs() {
    local -a approved_files;
    local -a rejected_files;

    # Instructions:
    printf "\e[2m
    - This script will open each diffing snapshot and prompt you to accept or reject it as the new baseline.
    - If you approve the changes, the script will replace the existing baseline image with the updated image and delete the diff file.
    - If you reject the changes, the script will move on to the next file (changes should be rejected if they are not expected and the test re-run after making the necessary fixes).
    - Continue this process until all files are assessed.
    \e[0m\n\n";


    process_image() {
        local image_file=$1;
        local image_name="${image_file//.diff.png/}";
        
        printf "\e[4m$image_name\e[0m\n";

        # Open image preview
        if [[ $(uname -s) == "Darwin" ]]; then
            open -g "$DIFF_DIR$image_file";
        else
            xdg-open "$DIFF_DIR$image_file";
        fi

        printf "\e[2mENTER to approve, SPACEBAR to reject\e[0m";
        IFS= read -r -n 1 -p "" answer;

        # On Linux we close the image preview for each image, on macOS we close the entire application at the end
        if [[ $(uname -s) == "Linux" ]]; then
            pkill -f "$DIFF_DIR$image_file";
        fi

        if [[ $answer == "" ]]; then
            approved_files+=("$image_name");
            printf "\e[32m✅ Approved changes\e[0m\e[2m - updating baseline\e[0m\n";

            local baseline_name="$image_name.snap.png";
            local diff_name="$image_name.diff.png";
            local updated_name="$image_name.updated.png";

            # Replace baseline image with updated image
            rm "$BASELINE_DIR$baseline_name";
            mv "$BASELINE_DIR$updated_name" "$BASELINE_DIR$baseline_name";
            rm "$DIFF_DIR$image_file";

        elif [[ $answer == " " ]]; then
            rejected_files+=("$image_name");
            printf "\e[33m\nRejected changes\e[0m\e[2m - run test again after fixes\e[0m\n";
        else
            rejected_files+=("$image_name");
            printf "\e[33m\nRejected changes\e[0m\e[2m - run test again after fixes\e[0m\n";
        fi

        printf "\n\n";
    }


    # Main loop to process images
    for file in "$DIFF_DIR"*.diff.png; do
        if [[ ! -e $file ]]; then
            echo "🎉 Visual regression passed!";
            exit 1;
        fi

        process_image "$(basename "$file")";
    done


    # Close image preview application on macOS
    if [[ $(uname -s) == "Darwin" ]]; then
        osascript -e 'quit app "Preview"';
    fi


    # Printf summary
    printf "\e[1mDone!\e[0m\n\n";

    if [[ ${#approved_files[@]} -gt 0 ]]; then
        printf "\e[2mApproved:\e[0m\n";
        for file in "${approved_files[@]}"; do
            printf "\e[32m$file\e[0m\n";
        done
    fi

    if [[ ${#rejected_files[@]} -gt 0 ]]; then
        if [[ ${#approved_files[@]} -gt 0 ]]; then
            printf "\n";
        fi
        printf "\e[2mRejected:\e[0m\n";
        for file in "${rejected_files[@]}"; do
            printf "\e[31m$file\e[0m\n";
        done
    fi

    printf "\n\e[2mTotal files:\e[0m\e[37m $((${#approved_files[@]} + ${#rejected_files[@]}))\e[0m\n";
    printf "\e[2mTotal approved:\e[0m\e[32m ${#approved_files[@]}\e[0m\n";
    printf "\e[2mTotal rejected:\e[0m\e[31m ${#rejected_files[@]}\e[0m\n\n";

    if [[ ${#rejected_files[@]} -gt 0 ]]; then
        printf "\e[33m⚠️  Since you rejected some changes: \n- Run this test again after making the necessary fixes in order to update the baseline images.\e[0m\n";
    fi
}




if [[ $test_type_slug == "full-suite" ]]; then
    # Clean up
    remove_diff_list;
    remove_diffs;
    remove_updated_snaps;

    npx cypress run --spec "$target_name" --env test-all=true;
    create_list_of_diffs; # these are the new, if any, diffs that were created in the previous step
    npx cypress run --spec "$target_name" --env capture-full-res-of-diffs=true;
    assess_existing_diffs;
fi


if [[ $test_type_slug == "retest-diffs" ]]; then
    # Clean up
    remove_diffs;
    remove_updated_snaps;

    npx cypress run --spec "$target_name" --env retest-diffs=true;
    create_list_of_diffs; # these are the new, if any, diffs that were created in the previous step
    npx cypress run --spec "$target_name" --env capture-full-res-of-diffs=true;
    assess_existing_diffs;
fi


if [[ $test_type_slug == "assess-diffs" ]]; then
    assess_existing_diffs;
fi
