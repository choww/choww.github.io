---
layout: post
title:  "🤿 Deep Dive: JSON Web Tokens"
image: ''
date:   2022-05-01 12:37:15
tags:
- authN/authZ
description: ''
categories:
- What's Going On?
---

I had to write a JWT authorizer for work recently and thought it would be a great time to finally learn more about them! JWT (**JSON Web Token**) is a standard for representing and exchanging identify-based information between a client and a server. It’s a **base64url-encoded** string that contains assertions (or **claims**) about the user that’s trying to access something on a resource server. JWTs can be used in both **authentication** (verify the user is who they say they are) and **authorization** (what resources a user is allowed to access).

## 🔎 What does a JWT look like?

A JWT is made up of 3 base64url-encoded segments, each separated by a dot `.`:

<img src="/assets/img/jwt.png"/>

Let’s break this down! 💃🏻

### Header

This is the first segment in the token:

<img src="/assets/img/jwt-header.png"/>

Which decodes to:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

The header contains information *about* the token, which typically includes the token type (`JWT` in this case) and the algorithm used to sign the token (`HS256`).

You might also sometimes see a Key ID (`kid`) in the header, which is just an arbitrary, *case-sensitive* string used to retrieve the key that’s required to verify the JWT signature. This can be useful for situations where there are multiple keys in a key store.

### Payload

This is the middle segment:

<img src="/assets/img/jwt-payload.png"/>

Which decodes to:

```json
{
  "id": "1234567890",
  "name": "Jane Doe",
  "iat": 1516239022,
  "exp": 1678401985
}
```

The **payload** contains information (claims) about the user and anything else you want. The JWT specification technically imposes no limit to how much or *what* information you can store in a JWT, but you might be restricted by the constraints set by the server receiving the token and the level of information security you require (more on this later).

### Signature

This is the last segment of the token:

<img src="/assets/img/jwt-signature.png"/>

The **signature** is a cryptographic hash that’s used to verify the information in the JWT have *not* been tampered with in transit. To create one, you take the token’s payload and header (collectively called the **signing input**), hash it, and then sign the hash. There are many signing algorithms, but the most common ones are:
- HMAC (Hash-Based Message Authentication Code) with SHA256
- RSASSA-PKCS1-v1_5 with SHA256
- ECDSA with P-256 and SHA256

With HMAC algorithms (prefixed with `HS`), the signing input is hashed using SHA256 and signed using a secret known to the token's creator and recipient. RSA (prefixed with `RS`) and ECDSA (prefixed with `ES`) algorithms are used to generate asymmetric signatures--where the hash is signed using a private key, and validated using a corresponding public key. RSA and ECDSA offer similiar levels of security, except with ECDSA you have the added bonus of smaller key sizes--which results in smaller JWTs as well (something to consider if performance is important).

HMAC is easier to implement but poses security issues if the secret is stolen, because the secret can be used to sign *and* validate tokens. RSA and ECDSA are more secure in comparison because the private key is not shared and only the party with the private key can sign tokens--this offers a way for token recipients to verify that tokens are created and signed by a trusted party.

The JWT signature is important because this is how the recipients of the token can verify that the token has not been tampered with in transit. As mentioned before, the signature comprises of the header, payload, and a secret or key. When a JWT is received by the resource server, it will take the token’s header and payload and generate its own hash using the algorithm in the JWT header. The generated hash is compared with the received hash, and if there’s a match, the token is considered valid and access is granted. (Note that in practice you don't have to implement any of this logic yourself, as there are many [libraries](https://jwt.io/libraries) out there that can handle this for you!)

## 🐣 Where do JWTs come from?

Although you can certainly generate your own JWTs with the help of libraries (e.g. the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) NPM package), JWTs can also be issued and signed by a dedicated server called an **authorization server**. You can use servers provided for you by companies like [Okta](https://www.okta.com) or you can create your own.

Authorization servers provide a public API that your application can use for tasks like requesting and refreshing tokens. For signature validation, the authorization server stores public keys and/or symmetric keys in a JSON structure known as a **JSON Web Key Set** (JWKS), which is accessible via the API as well.

Using a dedicated server for issuing and managing tokens greatly simplifies the software development process because it’s one less thing you have to worry about when building your application. In a microservices architecture, multiple applications can use the same authorization server. It also offers more fine-grained control because authorization servers and application servers will have different security and resource requirements.


## 🔌 How are JWTs used?

You'll often see JWTs being sent as bearer tokens when making API requests:

```bash
curl -iv -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMz
Q1Njc4OTAiLCJuYW1lIjoiSmFuZSBEb2UiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTY3ODQwMTk4NX0.mFw
PTU2wS60pWu1dI3TS7ytzWFysHsMhN1HeFcwJ0t0" https://localhost:8080/api
```

This mechanism is how the resource server knows what resources you’re allowed access to, and what actions you can take (if any).

JWTs are a key part of OAuth 2.0 and OpenID Connect (OIDC).

**OAuth 2.0** is a specification for authorization, allowing an application (the **client**) to access the user’s resources on a resource server. You, the **user**, already have access to both the client *and* the resource server, but with OAuth, you are allowing the *client* to access the resource server for you.

The client starts by asking you for access to the resource server, if you agree, an **authorization code** is returned. The client would then send a request to the authorization server and exchange the authorization code for an **access token**. The access token represents the permissions that the client has been granted and the token will be included in the header of every request to the resource server. This flow would also be familiar to you if you’ve ever had to get access to use a third party API.

Although access tokens can come in the form of JWTs, they can also just be opaque tokens/a random string instead. Some people like to use JWTs because the token contains all the information they need to validate someone’s permissions without having to make requests to an external service (e.g. a database) like you might have to when using opaque tokens.

**OpenID Connect** (OIDC) is based on OAuth 2.0, except it’s a means of *authentication*. This protocol allows you to implement federated identity management—where you can use one set of credentials to authenticate to many different applications. The flow is similar to OAuth2.0, except the client makes a request to an **identity provider** (which is just an authorization server that supports OIDC) to retrieve an **ID token** and optionally, an access token. The ID token is sent *back* to the client as proof that the user has been authenticated.

Unlike access tokens, ID tokens *must* be JWTs and also contains information about the authentication process such as the token’s intended recipient, token issuer, etc. The token *can* include basic user info as well (name, email, etc), although it's not required by the OIDC spec.

## 💭 Considerations

One major thing to be aware of is that **the JWT is valid until it expires**. This means even if you’ve deleted the JWT from your server/database/cache, the user will still have permissions granted by the JWT until it expires. For this reason, it’s a bad idea to use JWTs as session tokens.

Secondly, a key attribute of bearer tokens is that anyone who has it can use it. This obviously becomes an issue if the token is stolen, because as long as it can be validated by the resource server, access will be granted. This isn't a JWT-specific problem, but because they are sometimes used as bearer tokens, it's still something to be aware of. Luckily, there are some protections against this, the first is to ensure your tokens are short-lived by setting the `exp` claim, the second is to ensure you always make requests over HTTPS. Finally, you can also implement some type of **sender constraint** so that the sender has to offer some proof of their identity before their token can be used.

As mentioned earlier, there are no *official* restrictions for what you can include in the token's payload. However, remember that that JWTs are often just base64-encoded--**they are not encrypted!** Also, while token validation ensures that the information was not tampered with in transit, there's no mechanism to *prevent* it from happening, nor does it prevent someone else from using *your* token. So don’t store sensitive information in JWTs and don't rely on it for sending important information!
