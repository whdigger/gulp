# Workflow, automatic generation frontend 

## Usage

Setting project start with install configured data in file build.config.json

```json
{
  "srcPath": "src",                             // Folder with sources project
  "buildPath": "build",                         // Folder for build project
  "productionPath": "product",                  // Folder for production server
  "src": {                                      // From get sources files
    "js": [
      "js/**/*.js"
    ],
    "css": [
      "css/**/*.css"
    ],
    "postcss": [
      "postcss/front/**/*.pcss",
      "!postcss/front/constant.pcss"
    ],
    "mixinsDir": "postcss/mixins/",
    "img": [
      "img/**/*.*"
    ],
    "fonts": [
      "fonts/**/*.*"
    ],
    "html": [
      "*.html"
    ]
  },
  "change": {                                    // Move file from "postcss/front/" in folder "css/"
    "postcss": {
      "postcss/front/": "css/"
    }
  },
  "watch": {                                     // Watch changed in next directory 
    "html": "**/*.html",
    "js": "js/**/*.js",
    "css": "css/**/*.css",
    "postcss": "postcss/**/*.pcss",
    "img": "img/**/*.*",
    "fonts": "fonts/**/*.*"
  },
  "filter": {                                     // Setting for bower, take these file on pattern
    "js": "**/*.js",
    "css": "**/*.css",
    "img": [
      "*.jpg",
      "*.png",
      "*.gif"
    ],
    "fonts": [
      "*.eot",
      "*.woff",
      "*.svg",
      "*.ttf"
    ]
  }
}
```

Support command

```sh
npm run per            #Set permission in project 755
npm run ld <directory> #List files in directory, helper for build Json, example: npm run ld src/
npm run prod           #Build project on production 
npm run dev            #Build project on development
npm run devw           #Build project on development + watch
npm run devws          #Build project on development + watch + server
```

Command for build

```sh
gulp            #Build project on development without build-clean
gulp prod       #Build project on production without build-clean and mov to production
```

Troubleshooting

* The command sequence is important for postcss
* Some of the features you need to call them, not transfer it as a parameter postcssCalc**()**
* **PostcssMixins** should be on top of the call


## Использование

Настройка проекта начинается с установки конфигурационных данных в файл build.config.json

```json
{
  "srcPath": "src",                             // Папка с исходным проектом
  "buildPath": "build",                         // Папка для построенного проека
  "productionPath": "product",                  // Папка для боевого сервера
  "src": {                                      // Откуда брать исходные файлы
    "js": [
      "js/**/*.js"
    ],
    "css": [
      "css/**/*.css"
    ],
    "postcss": [
      "postcss/front/**/*.pcss",
      "!postcss/front/constant.pcss"
    ],
    "mixinsDir": "postcss/mixins/",
    "img": [
      "img/**/*.*"
    ],
    "fonts": [
      "fonts/**/*.*"
    ],
    "html": [
      "*.html"
    ]
  },
  "change": {                                    // Переложить файлы из "postcss/front/" в папку "css/"
    "postcss": {
      "postcss/front/": "css/"
    }
  },
  "watch": {                                     // Наблюдать за изменениями в следующих директориях 
    "html": "**/*.html",
    "js": "js/**/*.js",
    "css": "css/**/*.css",
    "postcss": "postcss/**/*.pcss",
    "img": "img/**/*.*",
    "fonts": "fonts/**/*.*"
  },
  "filter": {                                     // Настройки для bower, брать указанные файлы по шаблону
    "js": "**/*.js",
    "css": "**/*.css",
    "img": [
      "*.jpg",
      "*.png",
      "*.gif"
    ],
    "fonts": [
      "*.eot",
      "*.woff",
      "*.svg",
      "*.ttf"
    ]
  }
}
```

Вспомогательные команды

```sh
npm run per             #Установка прав на проект 755
npm run ld <argument>   #Список файлов в директории для Json
npm run prod            #Сборка проекта на production 
npm run dev             #Сборка проекта на development
npm run devw            #Сборка проекта на development + включение watch
npm run devws           #Сборка проекта на development + включение watch + сервера
```

Команды для сборки 

```sh
gulp                #Сборка проекта на development без build-clean
gulp prod           #Сборка проекта на production без build-clean и перенесение проекта в production
```

Тонкости работы

* Последовательность команд для postcss важна
* Для некоторых функций необходимо их вызывать прямо в массиве, а не передавать её в качестве параметра. postcssCalc**()**
* postcssMixins должна быть на верху вызова
