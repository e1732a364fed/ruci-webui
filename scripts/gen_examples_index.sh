#!/bin/bash

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查public目录是否存在
if [ ! -d "public" ]; then
  echo -e "${YELLOW}错误: 未找到 public 目录，请确保在项目根目录运行此脚本${NC}"
  exit 1
fi

# 确保目录存在
mkdir -p public/lua_examples
mkdir -p public/json_examples

# 递归查找文件并生成层级结构的JSON
generate_index() {
  local dir=$1
  local ext=$2
  local output_file=$3
  local temp_file=$(mktemp)
  
  echo "{" > "$temp_file"
  echo "  \"files\": [" >> "$temp_file"
  
  # 查找当前目录下的文件
  local files=$(find "$dir" -maxdepth 1 -type f -name "*.$ext" | sort)
  local first=true
  
  for file in $files; do
    filename=$(basename "$file")
    if [ "$first" = true ]; then
      echo "    \"$filename\"" >> "$temp_file"
      first=false
    else
      echo "    ,\"$filename\"" >> "$temp_file"
    fi
  done
  
  echo "  ]," >> "$temp_file"
  echo "  \"directories\": {" >> "$temp_file"
  
  # 查找子目录
  local dirs=$(find "$dir" -maxdepth 1 -type d | grep -v "^$dir$" | sort)
  local first_dir=true
  
  for subdir in $dirs; do
    dirname=$(basename "$subdir")
    if [ "$first_dir" = true ]; then
      echo "    \"$dirname\": $(generate_subdir_index "$subdir" "$ext")" >> "$temp_file"
      first_dir=false
    else
      echo "    ,\"$dirname\": $(generate_subdir_index "$subdir" "$ext")" >> "$temp_file"
    fi
  done
  
  echo "  }" >> "$temp_file"
  echo "}" >> "$temp_file"
  
  cat "$temp_file" > "$output_file"
  rm "$temp_file"
  
  echo "$output_file"
}

# 为子目录生成索引
generate_subdir_index() {
  local dir=$1
  local ext=$2
  local temp_file=$(mktemp)
  
  echo "{" > "$temp_file"
  echo "  \"files\": [" >> "$temp_file"
  
  # 查找当前子目录下的文件
  local files=$(find "$dir" -maxdepth 1 -type f -name "*.$ext" | sort)
  local first=true
  
  for file in $files; do
    filename=$(basename "$file")
    if [ "$first" = true ]; then
      echo "    \"$filename\"" >> "$temp_file"
      first=false
    else
      echo "    ,\"$filename\"" >> "$temp_file"
    fi
  done
  
  echo "  ]," >> "$temp_file"
  echo "  \"directories\": {" >> "$temp_file"
  
  # 查找子目录的子目录
  local subdirs=$(find "$dir" -maxdepth 1 -type d | grep -v "^$dir$" | sort)
  local first_subdir=true
  
  for subsubdir in $subdirs; do
    subdirname=$(basename "$subsubdir")
    if [ "$first_subdir" = true ]; then
      echo "    \"$subdirname\": $(generate_subdir_index "$subsubdir" "$ext")" >> "$temp_file"
      first_subdir=false
    else
      echo "    ,\"$subdirname\": $(generate_subdir_index "$subsubdir" "$ext")" >> "$temp_file"
    fi
  done
  
  echo "  }" >> "$temp_file"
  echo "}" >> "$temp_file"
  
  cat "$temp_file"
  rm "$temp_file"
}

# 生成lua_examples的index.json
echo -e "${GREEN}正在生成 lua_examples 的层级索引...${NC}"
generate_index "public/lua_examples" "lua" "public/lua_examples/index.json"
echo -e "${GREEN}已生成 lua_examples/index.json 文件${NC}"

# 生成json_examples的index.json
echo -e "${GREEN}正在生成 json_examples 的层级索引...${NC}"
generate_index "public/json_examples" "json" "public/json_examples/index.json"
echo -e "${GREEN}已生成 json_examples/index.json 文件${NC}"

echo -e "${GREEN}索引生成完成!${NC}" 