import { u8, u64, key } from "./db_types"

function store(schema: object) {
	return schema
}

const schema = store({
	id: key([u8, 36]),
	displayname: [u8, 72],
	username: [u8, 64],
	password: u64,
	created_at: u64,
	updated_at: u64
})

export default schema
