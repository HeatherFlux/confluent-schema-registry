# Get the current working directory
cwd=$(pwd)

# Read the contents of the `jest.config.ts` file
file_contents=$(cat "$cwd/jest.config.ts")
echo $(cat "$cwd/jest.config.ts" | grep "'^.")
coverage_reporters="  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipFull: false }], 'json-summary'],"

# Bail early if we already have this coverage reporter in the file by grepping for it and counting the number of lines and determine if that is greater
if [[ $(grep json-summary $cwd/jest.config.ts | wc -l) -gt 0 ]]; then
  echo "json-summary already exists"
  exit 0
fi

# If we don't find json-summary, but we do find coverageReporters, then we need to replace it with $coverage_reporters and exit the program
if [[ $(grep coverageReporters $cwd/jest.config.ts  | wc -l) -gt 0 ]]; then
  echo "coverageReporters exists, but json-summary does not"
  # Find the line that starts with the `coverageReporters` key
  coverage_reporters_line_number=$(echo "$file_contents" | grep -n "coverageReporters" | grep -v "//" | cut -d ":" -f1)
  beginning_of_file=$(echo "$file_contents" | sed -n "1, $(($coverage_reporters_line_number - 1)) p")
  rest_of_file=$(echo "$file_contents" | sed -n "$(($coverage_reporters_line_number + 1)), \$ p")

  # Insert the contents of the file back to disk, starting at the `coverageReporters` line
  echo "$beginning_of_file
$coverage_reporters
$rest_of_file" > "$cwd/jest.config.ts"
  exit 0
fi


# if coverageReporters doesn't exist then we need to insert $coverage_reporters after the `coverageDirectory` key
if [[ $(grep coverageDirectory $cwd/jest.config.ts  | wc -l) -gt 0 ]]; then
  echo "coverageDirectory exists, but coverageReporters does not"
  # Find the line that starts with the `coverageDirectory` key
  coverage_directory_line_number=$(echo "$file_contents" | grep -n "coverageDirectory" | grep -v "//" | cut -d ":" -f1)
  beginning_of_file=$(echo "$file_contents" | sed -n "1, $coverage_directory_line_number p")
  rest_of_file=$(echo "$file_contents" | sed -n "$(($coverage_directory_line_number + 1)), \$ p")

  # Insert the contents of the file back to disk, starting at the `coverageDirectory` line
  echo "$beginning_of_file
$coverage_reporters
$rest_of_file" > "$cwd/jest.config.ts"
  exit 0
fi
