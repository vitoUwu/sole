# Sole  

Sole is a Discord bot that assigns roles to guild members based on the content of their custom statuses. Whether your server uses custom statuses for organization, fun, or categorization, Sole ensures roles are assigned dynamically based on keywords or patterns in those statuses.  

## Features  

- [x] Dynamically assigns a role based on keywords or patterns in custom.

- [ ] Support for multiple roles.

- [ ] Support for multiple assigns.

- [x] Real-time updates when members change their statuses.

- [ ] Web Dashboard.

## Installation

### Environment Variables

```bash
MONGO_URI=
DISCORD_TOKEN=
```

1. Clone the repository:  
   ```bash  
   git clone https://github.com/vitoUwu/sole.git  
   cd sole
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Running:
   ```bash
   npm run build # since node doesn't support typescript, we need to transpile to javascript using tsc
   npm start
   ```
