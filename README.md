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
npm install @angular/cdk --save
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

| Property         | Default                   | Description                                                                                                      |
| ---------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| placeholder      |                           | Optional placeholder string, which gets displayed when value == null                                             |
| value            |                           | Value of the number input                                                                                        |
| min              | `Number.MIN_SAFE_INTEGER` | Minimum value (can be a float value)                                                                             |
| max              | `Number.MAX_SAFE_INTEGER` | Maximum value (can be a float value)                                                                             |
| bigStep          | 1                         | Number by which the current value should be in-/decremented using the nav/keyboard (can be a float value)        |
| smallStep        | 0.25                      | Number by which the current value should be in-/decremented if 'bigStep' can't be applied (can be a float value) |
| maxDecimalPlaces | 0                         | Maximum amount of decimal places that should be allowed to enter (exceeding decimal places get trimmed)          |
| fractions        | `false`                   | Boolean describing whether or not fractions should be rendered                                                   |
| i18nNumbers      | `true `                   | E.g. converts 0-9 to arabic digits, if arabic is the browser's default language                                  |
| hoverBorder      | `false`                   | Boolean describing whether or not the border should only render on hover                                         |
| hoverNav         | `true`                    | Boolean describing whether or not the navigation should only render on hover                                     |
| dir              |                           | Optional direction property describing the content's orientation. Can be:  `'ltr' \| 'rtl' \| 'auto'`            |

##### Directives

| Property | Description                 |
| -------- | --------------------------- |
| disabled | Sets the disabled attribute |
| required | Sets the required attribute |

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
