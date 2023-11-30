#!/bin/bash


printf "\e[36m\e[1m
 _  _  __  ____  ____  ____  ___ 
/ )( \(  )/ ___)(  _ \(  __)/ __)
\ \/ / )( \___ \ )   / ) _)( (_ \ 
 \__/ (__)(____/(__\_)(____)\___/
\e[0m\e[0m\n";


selected_target_id=0;
selected_target_name="";
clean_target_name="";
targets=()

for dir in ./cypress/e2e/*/ ; do
    dir_name=$(basename "$dir")
    if [ "$dir_name" != "_example_" ]; then
        targets+=("$dir_name")
    fi
done

select_test_target() {
    if [[ ${#targets[@]} == 0 ]]; then
        # No test targets found
        printf "\e[31mNo test targets found - see README \e[0m\n";
        exit 1;
    fi

    if [[ ${#targets[@]} == 1 ]]; then
        # Only one test target found
        selected_target_name=${targets[0]}
        clean_target_name=$selected_target_name
        selected_target_id=0
    else
        # Multiple test targets found
        printf "Select target:\n\n"

        for ((i=0; i<${#targets[@]}; i++)); do
            current=${targets[$i]}
            echo "$((i+1)). ${current}"
        done

        printf "\n"
        read -p "Enter the number of the target you want to select: " target_num

        target_num=$((target_num-1))
        selected_target_name=${targets[$target_num]}
        clean_target_name=$selected_target_name

        selected_target_id=$target_num
    fi
}


full_regression_test__name="Full"
full_regression_test__slug="full-regression-test"
full_regression_test__description="Run a full visual regression test of all endpoints and viewports (previous diffs are deleted)"

retest_diffs_only__name="Retest diffs only"
retest_diffs_only__slug="retest-diffs-only"
retest_diffs_only__description="Run only the tests which failed in the last run"

assess_existing_diffs__name="Assess diffs"
assess_existing_diffs__slug="assess-existing-diffs"
assess_existing_diffs__description="Assess the existing diffs (no tests are run)"

test_type_num=0;

select_test_type() {
    test_types=("full_regression_test" "retest_diffs_only" "assess_existing_diffs")

    printf "\nSelect test type:\n\n"

    for ((i=0; i<${#test_types[@]}; i++)); do
        name_var="${test_types[$i]}__name"
        desc_var="${test_types[$i]}__description"

        name_val="${!name_var}"
        desc_val="${!desc_var}"

        echo "$((i+1)). $name_val - $desc_val"
    done

    printf "\n"
    read -p "Enter the number of the type of test you want to run: " type_num

    type_num=$((type_num-1))
    selected_test_type=${test_types[$type_num]}

    test_type_num=$type_num
}

select_test_target;
select_test_type;

selected_target_name="";

if [[ $selected_target_id == 0 ]]; then
    selected_target_name="${targets[0]}";
elif [[ $selected_target_id == 1 ]]; then
    selected_target_name="${targets[1]}";
elif [[ $selected_target_id == 2 ]]; then
    selected_target_name="${targets[2]}";
fi

test_type_slug="";

if [[ $test_type_num == 0 ]]; then
    test_type_slug=$full_regression_test__slug;
elif [[ $test_type_num == 1 ]]; then
    test_type_slug=$retest_diffs_only__slug;
elif [[ $test_type_num == 2 ]]; then
    test_type_slug=$assess_existing_diffs__slug;
fi

printf "\n\e[4m\e[1mRunning $test_type_slug on $clean_target_name\e[0m\e[0m\n\n";







BASELINE_DIR="./cypress/snapshots/$clean_target_name/snaps.cy.ts/";
DIFF_DIR="./cypress/snapshots/$clean_target_name/snaps.cy.ts/__diff_output__/";
RECEIVED_DIR="./cypress/snapshots/$clean_target_name/snaps.cy.ts/__received_output__/";
DIFF_JAVASCRIPT_LIST_DIR="./cypress/e2e/$clean_target_name/";


remove_diff_list() {
    if [[ -f "$DIFF_JAVASCRIPT_LIST_DIR"diff_list.ts ]]; then
        echo 'export const diffs: string[] = [];' > "$DIFF_JAVASCRIPT_LIST_DIR"diff_list.ts;
    fi
}

remove_diffs() {
    if [ -d "$DIFF_DIR" ] && [ "$(ls -A $DIFF_DIR)" ]; then
        rm -r "$DIFF_DIR"/*;
    fi
}

remove_received() {
    if [ -d "$RECEIVED_DIR" ] && [ "$(ls -A $RECEIVED_DIR)" ]; then
        rm -r "$RECEIVED_DIR"/*;
    fi
}

create_list_of_diffs() {
    if [ "$(ls -A $DIFF_DIR)" ]; then
        touch "$DIFF_JAVASCRIPT_LIST_DIR"diff_list.ts;

        echo 'export const diffs: string[] = [' > "$DIFF_JAVASCRIPT_LIST_DIR"diff_list.ts;

        for file in "$DIFF_DIR"*.diff.png; do
            echo "\"$(basename "$file")\"," >> "$DIFF_JAVASCRIPT_LIST_DIR"diff_list.ts;
        done

        echo '];' >> "$DIFF_JAVASCRIPT_LIST_DIR"diff_list.ts;
    fi
}

assess_existing_diff_images() {
    local -a approved_files;
    local -a rejected_files;

#     # Instructions:
#     printf "\e[2m
# - This script will open each diffing snapshot and prompt you to accept or reject it as the new baseline.
# - If you approve the changes, the script will replace the existing baseline image with the received image and delete the diff file.
# - If you reject the changes, the script will move on to the next file (changes should be rejected if they are not expected and the test re-run after making the necessary fixes).
# - Continue this process until all files are assessed.
#     \e[0m\n\n";



    process_image() {
        local image_file=$1;
        local image_name="${image_file//.diff.png/}";
        
        printf "\e[4m$image_name\e[0m\n";

        # Open image preview
        open_image() {
            if [[ $(uname -s) == "Darwin" ]]; then
                open -g "$DIFF_DIR$image_file";
            else
                xdg-open "$DIFF_DIR$image_file";
            fi
        }

        open_image

        printf "\e[2mENTER to approve, SPACEBAR to reject, R to reopen image\e[0m";
        
        while true; do
            IFS= read -r -n 1 -p "" answer;

            # On Linux we close the image preview for each image, on macOS we close the entire application at the end
            if [[ $(uname -s) == "Linux" ]]; then
                pkill -f "$DIFF_DIR$image_file";
            fi

            if [[ $answer == "" ]]; then
                approved_files+=("$image_name");
                printf "\e[32m✅  Approved changes\e[0m\e[2m - updating baseline\e[0m\n";

                local baseline_name="$image_name.base.png";
                local diff_name="$image_name.diff.png";
                local received_name="$image_name-received.png";

                # Replace baseline image with received image
                rm "$BASELINE_DIR$baseline_name";
                mv "$RECEIVED_DIR$received_name" "$BASELINE_DIR$baseline_name";
                rm "$DIFF_DIR$image_file";

                break
            elif [[ $answer == "r" ]]; then
                open_image
            elif [[ $answer == " " ]]; then
                rejected_files+=("$image_name");
                printf "\e[33m\nRejected changes\e[0m\e[2m - run test again after fixes\e[0m\n";
                break
            fi
        done

        printf "\n\n";
    }




    # Main loop to process images
    printf "Opening preview...\n\n";

    for file in "$DIFF_DIR"*.diff.png; do
        if [[ ! -e $file ]]; then
            echo "🎉  Visual regression passed! (No diffs found)";
            exit 1;
        fi

        process_image "$(basename "$file")";
    done


    # Close image preview application on macOS
    if [[ $(uname -s) == "Darwin" ]]; then
        osascript -e 'quit app "Preview"';
    fi


    # Summary
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




cypress_flag=$1;

if [[ $cypress_flag == "--gui" ]]; then
    printf "\e[2mRunning in GUI mode - Assessment of eventual diffs must be done manually\e[0m\n\n";
fi

spec_path="./cypress/e2e/$selected_target_name/snaps.cy.ts";

if [[ $test_type_slug == "full-regression-test" ]]; then
    remove_diff_list;
    remove_diffs;
    remove_received;

    if [[ $cypress_flag == "--gui" ]]; then
        npx cypress open --env test-all=true,failOnSnapshotDiff=false;
    else
        npx cypress run --spec "$spec_path" --env test-all=true,failOnSnapshotDiff=false;
    fi
    
    assess_existing_diff_images;
fi


if [[ $test_type_slug == "retest-diffs-only" ]]; then
    create_list_of_diffs; # these are the new, if any, diffs that were created in the cypress test (used in the next run)
    remove_diffs;
    remove_received;

    if [[ $cypress_flag == "--gui" ]]; then
        npx cypress open --env retest-diffs-only=true,failOnSnapshotDiff=false;
    else
        npx cypress run --spec "$spec_path" --env retest-diffs-only=true,failOnSnapshotDiff=false;
    fi

    remove_diff_list;
    assess_existing_diff_images;
fi


if [[ $test_type_slug == "assess-existing-diffs" ]]; then
    remove_diff_list;
    assess_existing_diff_images;
fi

exit 1;