import os
import argparse
import time
import random
import sys


def tmp(text1, text2):
    print('start tmp')
    if random.random() < 0.5:
        print('failed!')
        sys.exit(1)
    path = os.getcwd()
    print(path)
    time.sleep(5.0)
    os.makedirs(text1, exist_ok=True)
    with open(text1+"/"+text2, 'w') as fp:
        fp.write('this is test.')
    print('end tmp')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('arg1')
    parser.add_argument('arg2')
    args = parser.parse_args()
    tmp(args.arg1, args.arg2)
