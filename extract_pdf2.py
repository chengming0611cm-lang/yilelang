# -*- coding: utf-8 -*-
import pdfplumber
import os
import sys
import warnings
warnings.filterwarnings("ignore")
import logging
logging.disable(logging.CRITICAL)

pdfs = [
    ("book1_ClaudeCode", r"D:\Download\cunchu\za\Claude+Code实战Harness工程之道.pdf", 20),
    ("book2_Benti", r"D:\Download\cunchu\za\本体驱动的AI数据管理 A5.pdf", 20),
    ("book3_Skill", r"D:\Download\cunchu\za\图解Skill：AI提效实战指南.pdf", 20),
]

outdir = r"D:\Download\cunchu\za"
for name, path, max_pages in pdfs:
    outpath = os.path.join(outdir, name + ".txt")
    size_mb = os.path.getsize(path) / 1024 / 1024
    print(f"处理: {name} ({size_mb:.1f}MB) -> {outpath}")
    try:
        with pdfplumber.open(path) as pdf:
            total_pages = len(pdf.pages)
            sample_pages = min(total_pages, max_pages)
            with open(outpath, "w", encoding="utf-8") as f:
                f.write(f"=== {name} 总页数:{total_pages} ===\n")
                for i in range(sample_pages):
                    try:
                        text = pdf.pages[i].extract_text() or ""
                    except Exception as e:
                        text = f"[第{i+1}页提取失败: {e}]"
                    if text.strip():
                        f.write(f"\n--- 第 {i+1} 页 ---\n")
                        f.write(text)
                        f.write("\n")
        print(f"  完成, 提取前{sample_pages}页")
    except Exception as e:
        print(f"  失败: {e}")
print("全部完成")
