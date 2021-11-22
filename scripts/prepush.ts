#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import semver from 'semver';
import chalk from 'chalk';
import shell from 'shelljs';
import pkg from '../package.json';

const program = new commander.Command();

const { version } = pkg;

function isValidNewVersion(oldVersion, newVersion) {
  return !!(semver.valid(newVersion) || semver.inc(oldVersion, newVersion));
}

async function inputVersion() {
  // 弹出当前版本，并提示用户输入最新版本号
  const { newVersion } = await inquirer.prompt([
    {
      type: 'input',
      message: `请输入版本号(当前版本:${version})`,
      name: 'newVersion',
    },
  ]);

  if (
    isValidNewVersion(version, newVersion) &&
    semver.lt(version, newVersion)
  ) {
    try {
      // 更改package的version
      if (
        shell.exec(
          `npm version ${newVersion} --no-commit-hooks --no-git-tag-version`,
        ).code !== 0
      ) {
        console.log(chalk.red('更新失败'));
        shell.echo('Error: npm version error');
        shell.exit(1);
      } else {
        const addCode = shell.exec(`git add .`).code;
        const commitCode = shell.exec(
          `git commit -m "v${newVersion}" --no-verify`,
        ).code;
        if (addCode === 0 && commitCode === 0) {
          console.log(chalk.green(`更新版本成功，最新版本:${newVersion}`));
        } else {
          shell.exit(1);
        }
      }
    } catch (err) {
      console.log(err, chalk.grey('err~!'));
      shell.exit(1);
    }
  } else {
    // 提示输入不合法，重新输入
    console.error(
      chalk.red('输入不合法，请遵循npm语义化'),
      chalk.underline('https://semver.org/lang/zh-CN/'),
    );
    inputVersion();
  }
}

async function main() {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }

  // 只有在 master 或 develop 分支才会弹出
  const allowBranch = ['master', 'develop'];
  const gitBranchName = shell.exec(`git rev-parse --abbrev-ref HEAD`, {
    silent: true,
  });

  if (allowBranch.includes(gitBranchName.stdout.trim())) {
    program.version(version).action(async () => {
      const { update } = await inquirer.prompt([
        {
          type: 'list',
          message: '是否更新网站版本？',
          name: 'update',
          choices: ['no', 'yes'],
        },
      ]);

      if (update === 'yes') {
        await inputVersion();
      } else {
        shell.exit(0);
      }
    });
    program.parse(process.argv);
  } else {
    console.log(
      chalk.yellow(`当前分支为:${gitBranchName.stdout}不执行版本更新操作`),
    );
  }
}

main();
