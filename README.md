# Ngx Simple Spinner

Simple and lightweight, yet customizable spinner/number input module for Angular.

[Demo](https://ngx-simple-spinner.netlify.app/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/abae043e-6027-4493-bb44-aa1f4de436b0/deploy-status)](https://app.netlify.com/sites/ngx-simple-spinner/deploys)

This is a number input component for Angular, fully supporting template driven forms and form validation. It is completely customizable using SCSS/CSS.
Additionally it features: displaying most common fractions (1/2, 1/3, 1/4, ...), setting decimal places, i18n and RTL (right-to-left).
It replicates Google Chrome's behaviour regarding its base functionality.

## Installation

Ngx Simple Spinner requires Angular 9 or above.

```sh
npm install @nutrify/ngx-simple-spinner --save
```

You might also need to install @angular/cdk:

```sh
npm install @angular/cdk@9.2.4 --save
```

For styling import @nutrify/ngx-simple-spinner/scss/styles.scss or @nutrify/ngx-simple-spinner/css/styles.css

## Usage

**app.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SimpleSpinnerModule } from '@nutrify/ngx-simple-spinner';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SimpleSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

**component.ts:**

```typescript
// ...

export class Component {
  value = 12.5;
}
```

**component.html:**

```html
<!-- ... -->

<simple-spinner [(ngModel)]="value" min="1" max="100" smallStep="0.25" maxDecimalPlaces="2" fractions="true"></simple-spinner>

<!-- ... -->
```

Check out the [source code](https://github.com/raphaelM-sudo/ngx-simple-spinner/tree/master/src/app) for an example.

#### Spinner

##### Inputs

| Property    | Default | Description                                                                                                |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| placeholder |         | Optional placeholder string, which gets displayed when no option is selected                               |
| value       |         | Value of selected option                                                                                   |
| hoverBorder | `false` | Boolean describing whether or not the border should only render on hover                                   |
| animate     | `true`  | Boolean describing whether or not the arrow icon should show an animation                                  |
| dir         |         | Optional direction property describing the content's text orientation. Can be:  `'ltr' \| 'rtl' \| 'auto'` |

##### Directives

| Property | Description                                        |
| -------- | -------------------------------------------------- |
| disabled | Sets the disabled attribute for the select element |
| required | Sets the required attribute for the select element |

## Styling

You can use SCSS or CSS  for styling.

Just import the stylesheet and apply changes to it.

The SCSS stylesheet is recommended since it exports more variables.

If you are not using SCSS for your Angular projects already, you really should.

[The migration is very easy.](https://medium.com/@ngubanethabo.ambrose/migrate-from-css-to-scss-stylesheets-for-existing-angular-application-d61f8061f5b7)

### CSS / SASS

```scss
@import '~@nutrify/ngx-simple-spinner/scss/styles';
```

### Angular

**angular-cli.json:**

```json
"styles": [
  "styles.css",

  "../node_modules/@nutrify/ngx-simple-spinner/css/styles.css"
]
