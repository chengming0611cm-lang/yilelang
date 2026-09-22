# -*- coding: utf-8 -*-
import pdfplumber
import os
import warnings
warnings.filterwarnings("ignore")
import logging
logging.disable(logging.CRITICAL)

path = r"D:\Download\cunchu\za\本体驱动的AI数据管理 A5.pdf"
outpath = os.path.join(r"D:\Download\cunchu\za", "book2_Benti.txt")

# 提取关键页：目录(通常在前面)+多个章节采样
sample_indices = list(range(0, 8)) + list(range(20, 45)) + list(range(60, 85)) + list(range(120, 140)) + list(range(200, 220)) + list(range(300, 320))

with pdfplumber.open(path) as pdf:
    total_pages = len(pdf.pages)
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(f"=== 本体驱动的AI数据管理 总页数:{total_pages} ===\n")
        for i in sample_indices:
            if i >= total_pages:
                break
            try:
                text = pdf.pages[i].extract_text() or ""
            except Exception as e:
                text = f"[第{i+1}页提取失败: {e}]"
            if text.strip():
                f.write(f"\n--- 第 {i+1} 页 ---\n")
                f.write(text)
                f.write("\n")
print(f"完成, 总页数{total_pages}")
