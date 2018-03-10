#include <nan.h>
#include <bs/miner.hpp>

using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;
using Nan::GetFunction;
using Nan::New;
using Nan::Set;

NAN_MODULE_INIT(InitAll) {
  Set(target, New<String>("MineAsync").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(MineAsync)).ToLocalChecked());
  Set(target, New<String>("ValidateAsync").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(ValidateAsync)).ToLocalChecked());
  Set(target, New<String>("HashAsync").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(HashAsync)).ToLocalChecked());
}

NODE_MODULE(addon, InitAll)
