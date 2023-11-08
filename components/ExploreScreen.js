import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Image, Text, Center, Spinner, Box, ScrollView, Button } from "native-base";
import axios from "axios";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetInfo } from "@react-native-community/netinfo";


const apiUrl = "https://api.artic.edu/api/v1/artworks?page={page}&limit=10"

const imageUrl = "https://www.artic.edu/iiif/2/{id}/full/843,/0/default.jpg"


export default function ExploreScreen({ navigation }) {
	const insets = useSafeAreaInsets();
	const netInfo = useNetInfo();

	const [isError, setError] = useState(false)
	const [isLoading, setLoading] = useState(true)

	const [imageId, setImageId] = useState("")



	useEffect(() => {
		const url = apiUrl.replace("{page}", Math.floor(Math.random() * 10000))
		axios.get(url)
			.then(function (response) {
				const randomIndex = Math.floor(Math.random() * 10)
				setImageId(response.data.data[randomIndex].image_id)
			})
			.catch(function (error) {
				setError(true)
			})
	}, []);


	return (
		<View>
			<Box p={5} backgroundColor="white" height="100%" style={{ paddingBottom: insets.bottom }}>
				<Text
					fontSize="md"
					fontWeight="light"
					mb={5}
				>
					Fuel your soul with the daily dose of creativity found in art. It's a brushstroke of inspiration that colors your everyday life.
				</Text>

				{netInfo.isConnected &&
					<Button
						onPress={() => {
							setLoading(true)
							setError(false)
							const url = apiUrl.replace("{page}", Math.floor(Math.random() * 10000))
							axios.get(url)
								.then(function (response) {
									const randomIndex = Math.floor(Math.random() * 10)
									setImageId(response.data.data[randomIndex].image_id)
								})
								.catch(function (error) {
									setError(true)
								})
						}}
						variant="outline"
						mt={5}
						_pressed={{ backgroundColor: "white", opacity: 0.5 }}
						isDisabled={isLoading}
					>
						<Text>Get new image</Text>
					</Button>
				}

				{netInfo.isConnected && isLoading && <Center pt={5}><Spinner color="red.500" /></Center>}
				{netInfo.isConnected && !isError && imageId && <Center p={0} m={0}>
					<Image
						source={{ uri: imageUrl.replace("{id}", imageId) }}
						alt="Failed to load image"
						resizeMode="contain"
						width="100%"
						height={300}
						mt={5}
						onLoadStart={() => setLoading(true)}
						onLoadEnd={() => setLoading(false)}
						style={{ opacity: isLoading ? 0.5 : 1 }}
					/>
				</Center>
				}

				{!netInfo.isConnected && <Center pt={5}>
					<Text
						fontSize="md"
						fontWeight="light"
					>
						Explore more art when you're online!</Text>
					<Image
						source={require('../assets/pollock.jpg')}
						alt="No internet"
						resizeMode="contain"
						width="100%"
						height={300}
						mt={5}
					/>
				</Center>}


			</Box>

		</View>
	);

}
