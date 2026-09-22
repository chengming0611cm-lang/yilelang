# -*- coding: utf-8 -*-
import pdfplumber
import sys
import os

pdfs = [
    ("Claude+Code", r"D:\Download\cunchu\za\Claude+Code实战Harness工程之道.pdf"),
    ("本体驱动", r"D:\Download\cunchu\za\本体驱动的AI数据管理 A5.pdf"),
    ("图解Skill", r"D:\Download\cunchu\za\图解Skill：AI提效实战指南.pdf"),
]

for name, path in pdfs:
    size_mb = os.path.getsize(path) / 1024 / 1024
    print(f"\n{'='*60}")
    print(f"书名: {name}  文件大小: {size_mb:.1f}MB")
    print(f"{'='*60}")
    try:
        with pdfplumber.open(path) as pdf:
            total_pages = len(pdf.pages)
            print(f"总页数: {total_pages}")
            # 提取前15页文本 + 目录/前言，足够把握核心观点
            sample_pages = min(total_pages, 15)
            for i in range(sample_pages):
                try:
                    text = pdf.pages[i].extract_text() or ""
                except Exception as e:
                    text = f"[第{i+1}页提取失败: {e}]"
                if text.strip():
                    print(f"\n--- 第 {i+1} 页 ---")
                    print(text[:2000])
    except Exception as e:
        print(f"打开失败: {e}")
