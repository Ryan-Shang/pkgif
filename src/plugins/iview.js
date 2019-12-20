import Vue from 'vue';
import {
  Button,
  Upload,
  Icon,
  Card,
  Form, FormItem,
  Select, Option,
  Checkbox,
  InputNumber,
  ColorPicker,
  Poptip,
  Modal,
  Message,
  Spin,
  Input,
} from 'view-design';

Vue.component('Button', Button);
Vue.component('Upload', Upload);
Vue.component('Icon', Icon);
Vue.component('Card', Card);
Vue.component('Form', Form);
Vue.component('FormItem', FormItem);
Vue.component('Select', Select);
Vue.component('Option', Option);
Vue.component('Checkbox', Checkbox);
Vue.component('InputNumber', InputNumber);
Vue.component('ColorPicker', ColorPicker);
Vue.component('Input', Input);
Vue.component('Poptip', Poptip);
Vue.component('Modal', Modal);
Vue.component('Spin', Spin);
Vue.prototype.$Message = Message;
Vue.prototype.$Spin = Spin;

import 'view-design/dist/styles/iview.css';
