import {
	SpecialStatus,
	TaggedImage,
	Xyz,
} from "farmbot";

// a local representation of the current status of position
export const demoPos: Record<Xyz, number | undefined> = {
	x: 0,
	y: 0,
	z: 0,
};

// limitation of the sample farmbot map
export const map_limit = {
	x: 2900,
	y: 1400,
	z: 400,
};

export const demoImages: TaggedImage[] = [
	{
		"kind": "Image",
		"specialStatus": SpecialStatus.SAVED,
		"body": {
			"id": 9,
			"device_id": 8,
			"attachment_processed_at": "2017-06-01T14:16:55.709Z",
			"updated_at": "2017-06-01T14:16:55.715Z",
			"created_at": "2017-06-01T14:15:50.666Z",
			"attachment_url": "https://www.realsimple.com/thmb/P9g1f-xU0Zr2cq2_3dMwfXizZcM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/impossible-to-kill-outdoor-plants-1-2000-f513b0574cb04674a1bce40b832b28dd.jpg",
			"meta": {
				"x": 632,
				"y": 347,
				"z": 164
			}
		},
		"uuid": "Image.9.3"
	},
	{
		"kind": "Image",
		"specialStatus": SpecialStatus.SAVED,
		"body": {
			"id": 8,
			"device_id": 8,
			"attachment_processed_at": "2017-06-01T14:16:45.899Z",
			"updated_at": "2017-06-01T14:16:45.903Z",
			"created_at": "2017-06-01T14:14:22.747Z",
			"attachment_url": "https://images.immediate.co.uk/production/volatile/sites/10/2021/04/2048x1365-Strelitzia-reginae-GettyImages-1270647929-4f76714.jpg?quality=90&resize=940,627",
			"meta": {
				"x": 632,
				"y": 347,
				"z": 164
			}
		},
		"uuid": "Image.8.4"
	},
	{
		"kind": "Image",
		"specialStatus": SpecialStatus.SAVED,
		"body": {
			"id": 7,
			"device_id": 8,
			"attachment_processed_at": "2017-06-01T14:16:34.839Z",
			"updated_at": "2017-06-01T14:16:34.984Z",
			"created_at": "2017-06-01T14:14:22.726Z",
			"attachment_url": "https://www.realsimple.com/thmb/1mcrAQoWk3QQgdjYr9hWErYOm_U=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/trends-real-simple-Home-2023-green-e1314b42c49b43449a79e95634b0fbca.jpg",
			"meta": {
				"x": 266,
				"y": 330,
				"z": 53
			}
		},
		"uuid": "Image.7.5"
	},
];
