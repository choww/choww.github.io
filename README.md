# choww.github.io

Created using the [space jekyll theme](https://github.com/victorvoid/space-jekyll-template)

```sh
bundle install
npm install
npm start
```

## Create a post

_posts create a file .md with structure:

```md
---
layout: post
title: "Lorem ipsum speak.."
date: 2016-09-13 01:00:00
image: '/assets/img/post-image.png'
description: 'about tech'
tags:
- lorem
- tech
categories:
- Lorem ipsum
twitter_text: 'How to speak with Lorem'
---
```

## How can I modify the theme ?

**Space Jekyll** uses the [Stylus](http://stylus-lang.com/) to process the css, then modifies the style of the theme in [this folder](https://github.com/victorvoid/space-jekyll-template/tree/master/src/styl).

You can go in the [variable.styl](https://github.com/victorvoid/space-jekyll-template/blob/master/src/styl/_variables.styl) and modify the colors. 
