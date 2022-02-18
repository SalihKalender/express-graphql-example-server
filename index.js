const express = require('express')
const graphql = require('graphql')
const fse = require('fs-extra')
const path = require('path')
const { GraphQLObjectType } = graphql
const { graphqlHTTP } = require('express-graphql')

const app = express();

const Post_data = require('./fake_data/posts.json')

const Post_Type = new GraphQLObjectType({
    name: 'Post',
    fields: {
        userId: { type: graphql.GraphQLInt },
        id: { type: graphql.GraphQLInt },
        title: { type: graphql.GraphQLString },
        body: { type: graphql.GraphQLString },
    }
})

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        getPost: {
            type: Post_Type,
            args: {
                id: {
                    type: graphql.GraphQLInt
                }
            },
            resolve: (_, { id }) => {     /* yukarıda belirttigimiz id */
                return Post_data.find(post => post.id == id)
            }
        },
        getAllPosts: {
            type: new graphql.GraphQLList(Post_Type),
            args: {
                id: {
                    type: graphql.GraphQLInt
                }
            },
            resolve: (_, { id }) => {     /* yukarıda belirttigimiz id */
                return Post_data
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
      addPost: {
        type: Post_Type,
        args: {
            title: { type: graphql.GraphQLString },
            body: { type: graphql.GraphQLString },
        },
        resolve(parent, args) {
            Post_data.push({
                id: Post_data.length + 1,
                userId: 4,
                title: args.title,
                body: args.body,
            });
            fse.outputFile(path.join(__dirname, '/fake_data/posts.json'), JSON.stringify(Post_data))
            return {...args, id: Post_data[Post_data.length - 1].id, userId: Post_data[Post_data.length - 1].userId};
        },
      },
      updatePost: {
        type: Post_Type,
        args: {
            id: { type: graphql.GraphQLInt },
            body: { type: graphql.GraphQLString },
            title: { type: graphql.GraphQLString }
        },
        resolve(parent, args) {
            let returned = {}
            Post_data.forEach(post => {
                if(post.id == args.id) {
                    post.body = args.body;
                    post.title = args.title;
                    returned = post
                }
            })
            fse.outputFile(path.join(__dirname, '/fake_data/posts.json'), JSON.stringify(Post_data))
            return returned
        } 
      },
      deletePost: {
        type: graphql.GraphQLString,
        args: {
            id: { type: graphql.GraphQLInt },
        },
        resolve(parent, args) {
            const index = Post_data.findIndex(post => post.id == args.id)
            Post_data.splice(index, 1)
            fse.outputFile(path.join(__dirname, '/fake_data/posts.json'), JSON.stringify(Post_data))
            return 'Delete Succesfully'
        }
      }
    },
  });


const Schema = new graphql.GraphQLSchema({ query:  QueryType, mutation: Mutation})

app.use('/graphql', graphqlHTTP({
    schema: Schema,
    graphiql: true
}))

app.listen(6969, () => {
    console.log('Running a GraphQL API server at localhost:6969/graphql')
})


