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
# If the user accepts, the script will replace the existing baseline image with the received image and delete the diff file.
# If the user rejects, the script will move on to the next file.
# Continue this process until all files are assessed.


printf "\e[36m\e[1m
 _  _  __  ____  ____  ____  ___ 
/ )( \(  )/ ___)(  _ \(  __)/ __)
\ \/ / )( \___ \ )   / ) _)( (_ \ 
 \__/ (__)(____/(__\_)(____)\___/
\e[0m\e[0m\n";


suite_target=0;
selected_target_name="";
clean_target_name="";
targets=()

for dir in ./cypress/e2e/*/ ; do
    dir_name=$(basename "$dir")
    if [ "$dir_name" != "_example_" ]; then
        targets+=("$dir_name")
    fi
done

load_suite_target() {
    # Get a list of all files in ./cypress/e2e

    printf "Please select suite target:\n\n"

    # Printf all targets with a number for selection.
    for ((i=0; i<${#targets[@]}; i++)); do
        current=${targets[$i]}
        # clean="${current//.\/cypress\/e2e\//}";
        # echo "$((i+1)). ${clean}"
        echo "$((i+1)). ${current}"
    done

    # Read user input
    printf "\n"
    read -p "Enter the number of the suite you want to select: " suite_target_num

    # Decrement suite_target_num because bash arrays are 0-indexed
    suite_target_num=$((suite_target_num-1))

    # Store the selected file name 
    selected_target_name=${targets[$suite_target_num]}
    # clean_target_name="${selected_target_name//.\/cypress\/e2e\//}";
    clean_target_name=$selected_target_name;

    suite_target=$suite_target_num
}


# Full suite
full_suite__id=1
full_suite__name="Full suite"
full_suite__slug="full-suite"
full_suite__description="Run the full suite of tests (previous diffs are deleted)"

# Retest diffs
retest_diffs__id=2
retest_diffs__name="Retest diffs"
retest_diffs__slug="retest-diffs"
retest_diffs__description="Run only the tests which failed in the last run"

# Assess diffs
assess_diffs__id=3
assess_diffs__name="Assess diffs"
assess_diffs__slug="assess-diffs"
assess_diffs__description="Assess the existing diffs (no tests are run)"

test_type_num=0;

select_test_type() {
    test_types=("full_suite" "retest_diffs" "assess_diffs")

    printf "\nPlease select test type:\n"

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

    # $type_num
    test_type_num=$type_num
}

load_suite_target;
select_test_type;

selected_target_name="";

if [[ $suite_target == 0 ]]; then
    selected_target_name="${targets[0]}";
elif [[ $suite_target == 1 ]]; then
    selected_target_name="${targets[1]}";
elif [[ $suite_target == 2 ]]; then
    selected_target_name="${targets[2]}";
fi

test_type_slug="";

if [[ $test_type_num == 0 ]]; then
    test_type_slug=$full_suite__slug;
elif [[ $test_type_num == 1 ]]; then
    test_type_slug=$retest_diffs__slug;
elif [[ $test_type_num == 2 ]]; then
    test_type_slug=$assess_diffs__slug;
fi

# clean_target_name="${selected_target_name//.\/cypress\/e2e\//}";
printf "\n\e[4m\e[1mRunning $test_type_slug on $clean_target_name\e[0m\e[0m\n\n";







BASELINE_DIR="./cypress/snapshots/$clean_target_name/snaps.cy.ts/";
DIFF_DIR="./cypress/snapshots/$clean_target_name/snaps.cy.ts/__diff_output__/";
RECEIVED_DIR="./cypress/snapshots/$clean_target_name/snaps.cy.ts/__received_output__/";
DIFF_LIST_DIR="./cypress/support/";


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

remove_received() {
    # Removes all diffs in the DIFF_DIR if there are any
    if [ "$(ls -A $RECEIVED_DIR)" ]; then
        rm -r "$RECEIVED_DIR"/*;
    fi
}

create_list_of_diffs() {
    # If there are diffs in the diff directory, loop through them and create a list of the filenames in the diff_list.txt file. Otherwise do nothing:
    if [ "$(ls -A $DIFF_DIR)" ]; then
        echo "Capturing complete screenshots of diffs";

        touch "$DIFF_LIST_DIR"diff_list.txt;

        for file in "$DIFF_DIR"*.diff.png; do
            cat "$DIFF_LIST_DIR"diff_list.txt;
        done
    fi
}

assess_existing_diff_images() {
    local -a approved_files;
    local -a rejected_files;

    # Instructions:
    printf "\e[2m
- This script will open each diffing snapshot and prompt you to accept or reject it as the new baseline.
- If you approve the changes, the script will replace the existing baseline image with the received image and delete the diff file.
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
            local received_name="$image_name-received.png";

            # Replace baseline image with received image
            rm "$BASELINE_DIR$baseline_name";
            mv "$RECEIVED_DIR$received_name" "$BASELINE_DIR$baseline_name";
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
            echo "🎉 Visual regression passed! (No diffs found)";
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



spec_path="./cypress/e2e/$selected_target_name/snaps.cy.ts";

if [[ $test_type_slug == "full-suite" ]]; then
    # Clean up
    remove_diff_list;
    remove_diffs;
    remove_received;

    npx cypress run --spec "$spec_path" --env test-all=true;
    assess_existing_diff_images;
    create_list_of_diffs; # these are the new, if any, diffs that were created in the cypress test (used in the next run)
fi


if [[ $test_type_slug == "retest-diffs" ]]; then
    # Clean up
    remove_diffs;
    remove_received;

    npx cypress run --spec "$spec_path" --env retest-diffs=true;
    remove_diff_list; # remove the old list of diffs
    assess_existing_diff_images;
    create_list_of_diffs; # these are the new, if any, diffs that were created in the cypress test (used in the next run)
fi


if [[ $test_type_slug == "assess-diffs" ]]; then
    remove_diff_list; # remove the old list of diffs
    assess_existing_diff_images;
    create_list_of_diffs; # these are the new, if any, diffs that were created in the cypress test (used in the next run)
fi

exit 1;