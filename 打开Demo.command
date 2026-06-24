#!/bin/bash

set -eu

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEMO_FILE="$ROOT_DIR/PointFlow-Demo.html"

if [ ! -f "$DEMO_FILE" ]; then
  echo "Demo 构建文件不存在，请先联系开发者重新构建。"
  read -r -p "按回车键关闭窗口..."
  exit 1
fi

open "$DEMO_FILE"
