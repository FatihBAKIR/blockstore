import { Document, Schema, Model, model} from "mongoose";

export interface IPost {
  uid : number;
  username : string;
  title : string;
  body : string;
}

export interface IPostModel extends IPost, Document {
}

export var PostSchema: Schema = new Schema({
  uid : Number,
  username: String,
  title: String,
  body: String
}, { timestamps: true });

PostSchema.pre("save", function(next) {
  GlobalUid++;
  next();
});

export const Post: Model<IPostModel> = model<IPostModel>("Post", PostSchema);

export let GlobalUid = 0;













// export class Post {

//   id : number;
//   username : string;
//   title : string;
//   body : string;

//   constructor (username : string, title : string, body : string) {
//     this.id = this.getId();
//     this.username = username;
//     this.title = title;
//     this.body = body;
//   }

//   private getId() {
//     let newId : number = Post.id;
//     Post.id++;
//     return newId
//   }

//   private static id : number = 0;
// }

// // MongoDB Schema Definition
// // const postSchema = new mongoose.Schema({
// //   id: Number,
// //   username: String,
// //   title: String,
// //   body: String
// // }, { timestamps: true });
// // this.postSchema = new mongoose.Schema({
// //       id: Number,
// //       username: String,
// //       title: String,
// //       body: String
// //     }, { timestamps: true });
// //     const PostMDB = mongoose.model('Post', postSchema);

// export class PostMDB {
//   schema : mongoose.Schema;
//   //model : mongoose.Model;

//   constructor (username : string, title : string, body : string) {
//     this.schema = new mongoose.Schema({
//       id: Number,
//       username: String,
//       title: String,
//       body: String
//     }, { timestamps: true });
//     let model = mongoose.model('Post', this.schema);
//   }
// }