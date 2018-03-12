import { Document, Schema, Model, model} from "mongoose";

export let GlobalUid = 0;

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

export const PostM: Model<IPostModel> = model<IPostModel>("PostM", PostSchema);

export class PostB implements IPost 
{
    uid : number;
    username : string;
    title : string;
    body : string;
    created_at: number;
    updated_at: number;

    constructor(uid : number = 0, username : string = "", title: string = "", body: string = "") 
    {
      this.uid = uid;
      this.username = username;
      this.title = title;
      this.body = body;
      this.created_at = Date.now();
      this.updated_at = Date.now();
    }

     static Serialize(post: PostB): string {
      return JSON.stringify(post);
    }

    static Deserialize(val: string): PostB {
      let post: PostB = new PostB();
      let postObj = JSON.parse(JSON.parse(val));
      
      post.uid = postObj.uid;
      post.username = postObj.username;
      post.title = postObj.title;
      post.body = postObj.body;
      post.created_at = postObj.created_at;
      post.updated_at = postObj.updated_at;

      return post;
    }

    static PreSave() {
      GlobalUid++;
    }
}