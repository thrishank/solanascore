# Sol Wrapped

## Installation

To install Sol Wrapped, clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/sol-wrapped.git
cd sol-wrapped
cp .env.example .env
npm install

```
1. Start a postgres instance using docker or get a free version from a cloud service
2. Get a free RPC url from quicknode or other rpc service and don't forget to lower the batchlimit
in /api/route.ts file to avoid rate limiting.



