import os
import argparse
import time
import random
import sys


def tmp(input_txt_path, output_txt_path):
    input_txt_path = os.path.normpath(input_txt_path)
    output_txt_path = os.path.normpath(output_txt_path)
    if not os.path.exists(input_txt_path):
        print(f'{input_txt_path} does not exist!')
        sys.exit(1)
    abs_dir = os.path.dirname(os.path.abspath(input_txt_path))
    base_name_ext = os.path.basename(input_txt_path)
    base_name, ext = os.path.splitext(base_name_ext)
    if ext != ".txt":
        print(f'extensiton {ext} is not .txt!')
        sys.exit(1)
    print('Start txt server program...')
    if random.random() < 0.1:
        print('failed!', flush=True, end='')
        sys.exit(1)
    num = 100
    lines = []
    with open(input_txt_path, 'r') as fp:
        for line in fp:
            lines.append(line)
        for i in range(0, num):
            time.sleep(0.02)
            print(f'Progress: {i} / {num}', flush=True, end='')
            lines.append(str(i) + '\n')
    if len(lines) < 1:
        print('Failed to load file!', flush=True, end='')
        sys.exit(1)
    with open(output_txt_path, 'w') as fp:
        for line in lines:
            fp.write(line)
    print('Finish txt server program!')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('input_txt_path')
    parser.add_argument('output_txt_path')
    args = parser.parse_args()
    tmp(args.input_txt_path, args.output_txt_path)
