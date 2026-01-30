#!/bin/bash

# Output file name
OUTPUT_FILE="repo.md"

# Clear the output file to start fresh
echo "" > "$OUTPUT_FILE"

echo "Generating context in $OUTPUT_FILE..."

# ---------------------------------------------------------
# Part 1: List all files in the repository
# ---------------------------------------------------------
echo "# Project File Structure" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
# git ls-files lists only tracked files (respects .gitignore)
git ls-files >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# ---------------------------------------------------------
# Part 2: Dump content of specific file types
# ---------------------------------------------------------

# Filter for .js, .html, and .json
# We explicitly exclude package-lock.json because it is usually too large for LLMs
git ls-files | grep -E "\.js$|\.html$|\.json$" | grep -v "package-lock.json" | while read -r file; do

    echo "Processing: $file"
    
    # 1. Write the filename as a header
    echo "## File: $file" >> "$OUTPUT_FILE"
    
    # 2. Start Markdown code block (inferring extension for syntax highlighting)
    ext="${file##*.}"
    echo '```'$ext >> "$OUTPUT_FILE"
    
    # 3. Dump file content
    cat "$file" >> "$OUTPUT_FILE"
    
    # 4. End Markdown code block
    echo -e "\n\`\`\`\n" >> "$OUTPUT_FILE"

done

echo "Done!"