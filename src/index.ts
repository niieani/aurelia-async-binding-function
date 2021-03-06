import {BindingFunction} from 'aurelia-binding-functions'
import {FrameworkConfiguration} from 'aurelia-framework'

export function configure(frameworkConfig: FrameworkConfiguration) {
  const viewResources = frameworkConfig.aurelia.resources
  const bindingFunctionInstance = frameworkConfig.container.get(AsyncBindingFunction)
  if (typeof viewResources.registerBindingFunction === 'function') {
    viewResources.registerBindingFunction('@async', bindingFunctionInstance)
  } else {
    throw new Error('You need to load the aurelia-binding-functions plugin before aurelia-async-binding-function.')
  }
}

export class AsyncBindingFunction implements BindingFunction {
  connect(callScope: CallScope, binding: Binding, scope: Scope) {
    const promise = callScope.args[0].evaluate(scope, binding.lookupFunctions, true) as Promise<any> & {promiseResult:any}
    
    binding.observeProperty(promise, 'promiseResult')
    
    if (promise.promiseResult === undefined && typeof promise.then === 'function') {
      promise.then(value => {
        promise.promiseResult = value
      })
    }
  }
  
  evaluate(callScope: CallScope, scope: Scope, lookupFunctions, mustEvaluate: boolean) {
    const promise = callScope.args[0].evaluate(scope, lookupFunctions, true) as Promise<any> & {promiseResult:any}
    return promise ? promise.promiseResult : undefined
  }
}
