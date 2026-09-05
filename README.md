# CWROS System

Operations dashboard MVP with a React client and Express API. It includes JWT authentication, role-aware API authorization, PostgreSQL operation records, live Socket.IO metrics, Dockerized PostgreSQL/Redis, and a simulated operation executor.

## Run locally

1. Copy `.env.example` to `.env` and set a secure `JWT_SECRET`.
2. Run `docker compose up -d db redis`.
3. Run `npm install` then `npm run dev`.
4. Open `http://localhost:5173` and sign in with `admin@cwros.com` / `password`.

The seeded password is deliberately for local development only. Change or remove it before deployment.



CUDA WASTE DISPOSAL ROUTE OPTIMIZATION SYSTEM (CWROS)

FULL SYSTEM REQUIREMENTS SPECIFICATION

Project Title:
Shortest Path Determination for Waste Disposal Management Using Dijkstra’s Algorithm: A Case Study of the CUDA Axis in Calabar Municipality

System Name:
CUDA Waste Disposal Route Optimization System (CWROS)

Version: 1.0

Document Type: Software System Requirements Specification

---

1. INTRODUCTION

1.1 Purpose

This document defines the complete functional, technical, architectural, database, interface, algorithmic, security, deployment, and testing requirements for the CUDA Waste Disposal Route Optimization System (CWROS).

CWROS is a web-based waste disposal route optimization application designed to determine the minimum-distance route from a selected waste collection point within the CUDA axis of Calabar Municipality to Lemna Dumpsite.

The system uses Dijkstra’s shortest path algorithm on a weighted road network graph. Nodes represent waste collection points, road junctions, and the final disposal destination, while edge weights represent road distances in kilometres.

The primary purpose of CWROS is to support waste collection and transportation decisions by providing the shortest available route, total route distance, estimated travel time, and estimated transportation or fuel cost.

This document is intended to serve as the authoritative implementation specification for software development using Codex.

---

2. SYSTEM OBJECTIVES

CWROS shall support the following objectives:

1. Identify and represent major waste collection points within the CUDA axis.
2. Represent the waste disposal road network as a weighted graph.
3. Apply Dijkstra’s algorithm to determine the shortest route.
4. Calculate the total minimum route distance.
5. Estimate travel time based on route distance and configured average speed.
6. Estimate transportation or fuel cost based on configured cost parameters.
7. Display the calculated route in a clear and understandable interface.
8. Maintain operational records of route calculations.
9. Provide an administrative interface for managing graph data and system parameters.
10. Provide a reliable and maintainable software architecture suitable for academic demonstration and practical use.

---

3. SYSTEM SCOPE

3.1 In Scope

The system shall provide:

- User authentication.
- Role-based access control.
- Waste collection point selection.
- Lemna Dumpsite as the default terminal destination.
- Weighted graph representation of the road network.
- Dijkstra shortest path calculation.
- Route reconstruction.
- Total distance calculation.
- Estimated travel time calculation.
- Estimated transportation/fuel cost calculation.
- Interactive map display.
- Route visualization.
- Operation history.
- System metrics.
- Administrative graph management.
- REST API endpoints.
- Database persistence.
- Input validation.
- Error handling.
- Basic system logging.
- Responsive web interface.
- Docker-based deployment support.

3.2 Out of Scope

The first version shall not include:

- Automatic vehicle tracking through GPS hardware.
- Automatic traffic prediction.
- Artificial intelligence route prediction.
- Live traffic-based route modification.
- Automatic waste-bin sensor integration.
- Online payment processing.
- Waste quantity prediction.
- Automatic vehicle dispatching.
- Navigation turn-by-turn voice guidance.
- Real-time road closure detection.

These features may be considered for future system extensions.

---

4. AUTHORITATIVE TECHNOLOGY STACK

To avoid implementation ambiguity, Codex shall use the following technologies.

4.1 Frontend

- React.js
- TypeScript
- TailwindCSS
- Zustand
- TanStack Query
- Leaflet.js
- React Leaflet
- Vite

4.2 Backend

- Python 3.11+
- Flask
- Flask-CORS
- Flask-JWT-Extended
- SQLAlchemy
- Flask-Migrate
- Python standard library heap-based priority queue where appropriate
- NetworkX may be used for graph verification or visualization, but the primary Dijkstra implementation shall remain explicit and understandable for academic demonstration.

4.3 Database

Primary production database:

- PostgreSQL 15+

Development fallback:

- SQLite may be used for local development where PostgreSQL is unavailable.

4.4 Cache

- Redis 7+

Redis shall be treated as an optional supporting service for the first academic prototype. The core shortest path functionality must not depend on Redis.

4.5 API

- RESTful HTTP API
- JSON request and response format
- JWT-based authentication

WebSockets shall not be required for the core route calculation because CWROS does not currently require real-time vehicle telemetry.

4.6 Deployment

- Docker
- Docker Compose
- NGINX where production reverse proxy functionality is required
- Gunicorn for production Flask serving

---

5. SYSTEM ARCHITECTURE

CWROS shall use a three-tier architecture.

+-------------------------------------------------------------------+
|                         PRESENTATION TIER                         |
|                                                                   |
| React.js + TypeScript                                             |
| TailwindCSS                                                       |
| Zustand                                                           |
| TanStack Query                                                    |
| Leaflet / React Leaflet                                           |
+----------------------------------+--------------------------------+
                                   |
                              HTTPS / REST
                                   |
+----------------------------------v--------------------------------+
|                         APPLICATION TIER                          |
|                                                                   |
| Python 3.11+                                                      |
| Flask                                                             |
| JWT Authentication                                                |
| Route Calculation Service                                         |
| Dijkstra Algorithm Engine                                         |
| Cost and Travel Time Calculator                                   |
| Validation and Business Logic                                     |
+----------------------------------+--------------------------------+
                                   |
                             SQLAlchemy
                                   |
+----------------------------------v--------------------------------+
|                            DATA TIER                               |
|                                                                   |
| PostgreSQL 15+                                                    |
|                                                                   |
| Users | Nodes | Edges | Operations | Metrics | System Settings   |
+-------------------------------------------------------------------+

---

6. USER ROLES

The system shall support three user roles.

6.1 Administrator

The administrator shall be able to:

- Log into the system.
- View system dashboard.
- Create and deactivate users.
- Manage collection nodes.
- Manage graph edges.
- Modify distance weights.
- Configure travel and cost parameters.
- View operation logs.
- View system metrics.
- Execute route calculations.
- View shortest route results.

6.2 Dispatcher

The dispatcher shall be able to:

- Log into the system.
- Select collection points.
- Execute route calculations.
- View shortest routes.
- View distance.
- View estimated travel time.
- View estimated transportation cost.
- View operation history.

The dispatcher shall not modify core graph configuration unless explicitly granted administrative privileges.

6.3 Operator

The operator shall be able to:

- Log into the system.
- Select a collection point.
- Execute route calculations.
- View shortest route information.
- View map route visualization.

---

7. STUDY AREA GRAPH MODEL

7.1 Graph Definition

The CWROS road network shall be represented as:

G = (V, E)

where:

- V represents the set of nodes.
- E represents the set of edges.
- Each edge contains a non-negative distance weight in kilometres.

The graph shall contain 18 nodes and 24 unique undirected edges.

7.2 Nodes

The authoritative node definitions are:

Node| Name| Description
A| Female Hostel CP| Female Hostel collection point
B| Pav2 CP| Pav2 collection point
C| B&W CP| B&W collection point
D| Unical VC Gate| University of Calabar Vice Chancellor's Gate
E| Unical Main Gate| University of Calabar Main Gate
F| Layout Road / Plaza CP| Layout Road / Plaza collection point
G| Unical Int'l CP| University of Calabar International collection point
H| Dr. Ekpeme Drive| Dr. Ekpeme Drive node
I| Bez Pharma| Bez Pharma node
J| Hospital Road CP 1| Hospital Road collection point 1
K| Abong Aseng| Abong Aseng node
L| Hospital Road CP 2| Hospital Road collection point 2
M| Etabgor Roundabout| Etabgor Roundabout
N| CUDA Junction| CUDA Junction
O| CUDA CP| CUDA collection point
P| Edim Otop| Edim Otop node
Q| Atimbo Roundabout| Atimbo Roundabout
R| Lemna Dumpsite| Final waste disposal destination

Node R shall always represent Lemna Dumpsite.

---

8. AUTHORITATIVE GRAPH EDGES

The following distances shall be used as the initial graph dataset.

Edge| From| To| Weight (km)
E1| A| C| 0.68
E2| A| B| 0.83
E3| B| C| 0.38
E4| C| D| 0.36
E5| D| E| 0.63
E6| D| G| 0.20
E7| E| F| 0.58
E8| F| G| 0.70
E9| F| H| 0.18
E10| G| J| 0.32
E11| H| I| 0.19
E12| H| G| 0.94
E13| I| K| 0.37
E14| I| J| 0.53
E15| J| L| 0.39
E16| K| M| 0.05
E17| K| L| 0.43
E18| L| N| 0.26
E19| M| N| 0.42
E20| N| O| 0.09
E21| O| P| 0.11
E22| O| Q| 1.13
E23| P| Q| 2.43
E24| Q| R| 7.64

All edge weights are non-negative.

Because the road network is modeled as undirected, each edge shall be available in both directions during graph construction.

---

9. INITIAL SHORTEST PATH EXPECTATION

For validation purposes, the system shall produce the following shortest route when the source is Node A and the destination is Node R:

A → C → D → G → J → L → N → O → Q → R

The expected total distance is:

11.07 km

The calculation is:

0.68 + 0.36 + 0.20 + 0.32 + 0.39 + 0.26 + 0.09 + 1.13 + 7.64
= 11.07 km

This value shall be used as one of the primary acceptance tests for the Dijkstra implementation.

---

10. DIJKSTRA ALGORITHM REQUIREMENTS

10.1 Algorithm

The system shall use Dijkstra’s shortest path algorithm as the primary shortest path algorithm.

The algorithm shall:

1. Initialize all tentative distances to infinity.
2. Set the source distance to zero.
3. Select the unvisited node with the smallest tentative distance.
4. Mark the selected node as permanently processed.
5. Relax each neighbouring edge.
6. Update a neighbour when a shorter distance is discovered.
7. Store predecessor information.
8. Continue until the destination is permanently processed or no reachable nodes remain.
9. Reconstruct the shortest path using predecessor relationships.

10.2 Required Internal Variables

The implementation should use variables equivalent to:

TL[v]          Tentative label or distance
PL             Permanent label / selected node
Predecessor[v] Previous node in shortest path
Visited[v]     Processing status

10.3 Relaxation Rule

For each edge:

NewDistance = TL[CurrentNode] + Weight(CurrentNode, Neighbor)

The system shall evaluate:

IF NewDistance < TL[Neighbor]
    THEN TL[Neighbor] = NewDistance
    AND Predecessor[Neighbor] = CurrentNode
ELSE
    retain existing TL[Neighbor]

10.4 Unreachable Destination

If the destination cannot be reached, the API shall return:

- "success: false"
- an appropriate error code
- a human-readable message
- no fabricated route or distance.

---

11. ROUTE CALCULATION SERVICE

The backend shall expose a dedicated route calculation service.

Conceptual function:

calculate_shortest_route(source, destination)

The function shall return:

{
  "success": true,
  "source": "A",
  "destination": "R",
  "path": ["A", "C", "D", "G", "J", "L", "N", "O", "Q", "R"],
  "distance_km": 11.07,
  "estimated_time_minutes": 0,
  "estimated_cost": 0
}

The exact time and cost values shall be calculated from configurable system parameters.

---

12. TRAVEL TIME CALCULATION

The system shall estimate travel time using:

Travel Time (hours) = Distance (km) / Average Speed (km/h)

The result shall be converted to minutes:

Travel Time (minutes) = (Distance / Average Speed) × 60

Average speed shall be configurable.

The system shall not claim that estimated travel time represents actual traffic conditions.

Example:

If:

Distance = 11.07 km
Average Speed = 30 km/h

then:

Travel Time = (11.07 / 30) × 60
            = 22.14 minutes

---

13. TRANSPORTATION AND FUEL COST

The system shall support configurable cost estimation.

A basic cost model shall be:

Estimated Cost = Distance × Cost Per Kilometre

Alternatively, where fuel consumption is explicitly configured:

Fuel Used = Distance / Fuel Efficiency

and:

Fuel Cost = Fuel Used × Fuel Price

The implementation shall store the selected cost model in system configuration.

The system must clearly label cost values as estimates.

---

14. DATABASE REQUIREMENTS

14.1 Users Table

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'OPERATOR'
        CHECK (role IN ('ADMIN', 'DISPATCHER', 'OPERATOR')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Passwords shall never be stored as plain text.

---

15. NODES TABLE

The system shall persist graph nodes.

CREATE TABLE nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(5) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    node_type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

"node_type" may contain values such as:

COLLECTION_POINT
JUNCTION
DESTINATION

---

16. EDGES TABLE

The system shall persist road connections.

CREATE TABLE edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES nodes(id),
    destination_node_id UUID NOT NULL REFERENCES nodes(id),
    distance_km NUMERIC(10,3) NOT NULL CHECK (distance_km >= 0),
    is_bidirectional BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

The system shall prevent negative distance values.

---

17. OPERATION LOGS TABLE

CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id VARCHAR(32) NOT NULL UNIQUE,
    task_description TEXT NOT NULL,
    input_size VARCHAR(50),
    processing_time_ms INTEGER NOT NULL,
    status VARCHAR(20)
        CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED')),
    source_node VARCHAR(5),
    destination_node VARCHAR(5),
    distance_km NUMERIC(10,3),
    executed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Every successful route calculation should generate an operation log.

---

18. SYSTEM METRICS TABLE

CREATE TABLE system_metrics (
    id BIGSERIAL PRIMARY KEY,
    active_nodes INTEGER NOT NULL,
    operational_rate NUMERIC(5,2) NOT NULL,
    system_load_ms INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---

19. SYSTEM SETTINGS TABLE

The application shall support configurable operational parameters.

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Initial settings may include:

default_destination = R
average_speed_kmh = 30
cost_per_km = 500
currency = NGN

These values are configuration examples and shall be clearly identified as configurable assumptions.

---

20. API REQUIREMENTS

All API endpoints shall use the "/api/v1" prefix.

20.1 Authentication

POST /api/v1/auth/login

Request:

{
  "email": "user@cwros.com",
  "password": "password"
}

Response:

{
  "success": true,
  "token": "JWT_BEARER_STRING",
  "user": {
    "id": "USER_ID",
    "username": "operator",
    "role": "OPERATOR"
  }
}

POST /api/v1/auth/refresh

The endpoint shall issue a refreshed authentication token where the existing refresh mechanism is valid.

---

21. NODE API

GET /api/v1/nodes

Returns active nodes.

GET /api/v1/nodes/{code}

Returns details for one node.

POST /api/v1/nodes

Creates a node.

Administrator access required.

PUT /api/v1/nodes/{code}

Updates a node.

Administrator access required.

DELETE /api/v1/nodes/{code}

Deactivates a node.

Administrator access required.

---

22. EDGE API

GET /api/v1/edges

Returns graph edges.

POST /api/v1/edges

Creates an edge.

Administrator access required.

PUT /api/v1/edges/{id}

Updates an edge distance or configuration.

Administrator access required.

DELETE /api/v1/edges/{id}

Deactivates an edge.

Administrator access required.


23. ROUTE API

POST /api/v1/routes/shortest-path

Request:

{
  "source": "A",
  "destination": "R"
}

Response:

{
  "success": true,
  "operation_id": "OP-001",
  "source": {
    "code": "A",
    "name": "Female Hostel CP"
  },
  "destination": {
    "code": "R",
    "name": "Lemna Dumpsite"
  },
  "path": [
    "A",
    "C",
    "D",
    "G",
    "J",
    "L",
    "N",
    "O",
    "Q",
    "R"
  ],
  "route_names": [
    "Female Hostel CP",
    "B&W CP",
    "Unical VC Gate",
    "Unical Int'l CP",
    "Hospital Road CP 1",
    "Hospital Road CP 2",
    "CUDA Junction",
    "CUDA CP",
    "Atimbo Roundabout",
    "Lemna Dumpsite"
  ],
  "distance_km": 11.07,
  "estimated_time_minutes": 22.14,
  "estimated_cost": 5535.00,
  "currency": "NGN"
}

The actual cost shall be determined from the active system configuration.


24. DASHBOARD API

GET /api/v1/dashboard/metrics

The endpoint shall return summary information such as:

{
  "active_nodes": 18,
  "active_edges": 24,
  "operational_rate": 99.80,
  "average_processing_time_ms": 12,
  "total_operations": 100
}

Values shall be calculated from actual application data where possible.

The system shall not display fabricated operational statistics as real measurements.

25. OPERATION LOG API

GET /api/v1/operations/logs

Supported parameters:

page
limit
status
source
destination

Example:

/api/v1/operations/logs?page=1&limit=20&status=SUCCESS

The response shall be paginated.


26. FRONTEND REQUIREMENTS

The frontend shall provide the following primary views:

1. Login Page
2. Dashboard
3. Route Optimization Page
4. Map View
5. Operation History
6. Node Management
7. Edge Management
8. System Settings
9. User Management
10. Error and Not Found Pages

27. LOGIN PAGE

The login interface shall contain:

- Email input.
- Password input.
- Login button.
- Validation messages.
- Loading state.
- Authentication error message.

The interface shall not expose passwords.

28. DASHBOARD
The dashboard shall provide a simple overview of the CWROS system and display:
•Recent route calculations.
•Total distance covered.
•Active regions or nodes.
•Selected route information.
The dashboard should provide a concise overview of the system.

29. ROUTE OPTIMIZATION INTERFACE

The route optimization page shall contain:

- Source node selector.
- Destination selector.
- Calculate Route button.
- Loading indicator.
- Route summary.

