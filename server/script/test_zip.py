import os
import argparse
import time
import random
import sys
import shutil


def tmp(input_zip_path, output_zip_path):
    input_zip_path = os.path.normpath(input_zip_path)
    output_zip_path = os.path.normpath(output_zip_path)
    if not os.path.exists(input_zip_path):
        print(f'{input_zip_path} does not exist!')
        sys.exit(1)
    abs_dir = os.path.dirname(os.path.abspath(input_zip_path))
    base_name_ext = os.path.basename(input_zip_path)
    base_name, ext = os.path.splitext(base_name_ext)
    if ext != ".zip":
        print(f'extensiton {ext} is not .zip!')
        sys.exit(1)
    print('Start zip server program...')
    # if random.random() < 0.1:
    #    print('failed!', flush=True, end='')
    #    sys.exit(1)

    tmp_dir = output_zip_path + ".tmpdir"
    print(f'Unpack zip to {tmp_dir}', flush=True, end='')
    os.makedirs(tmp_dir, exist_ok=True)
    shutil.unpack_archive(input_zip_path, tmp_dir)

    image_names = []
    processing_dir = os.path.join(tmp_dir, os.listdir(tmp_dir)[0])
    print(f'Start preprocess for {processing_dir}', flush=True, end='')
    for x in os.listdir(processing_dir):
        _, img_ext = os.path.splitext(x)
        img_ext = img_ext.lower()
        if img_ext in [".png", ".jpg", ".jpeg"]:
            image_names.append(x)

    for image_name in image_names:
        print(f'Processing {image_name}', flush=True, end='')
        time.sleep(0.2)
        img_basename, _ = os.path.splitext(image_name)
        process_file_path = os.path.join(
            processing_dir, img_basename + ".txt")
        with open(process_file_path, 'w') as fp:
            fp.write("Process result of " + image_name)

    print(f'Pack zip to {output_zip_path}', flush=True, end='')
    shutil.make_archive(os.path.splitext(output_zip_path)[0],
                        format='zip', root_dir=processing_dir)

    print('Finish zip server program!')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('input_zip_path')
    parser.add_argument('output_zip_path')
    args = parser.parse_args()
    tmp(args.input_zip_path, args.output_zip_path)
