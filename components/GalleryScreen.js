import React, { useState, useEffect } from 'react';
import {
	Image, Text, Box, Icon, VStack, ScrollView,
	Flex, Pressable, Menu, HamburgerIcon, Spinner,
	Center, Modal, Input, Button, useToast
} from "native-base";

import { getFiles, getMetadata, getImage, showFormatedDate, deleteFile, renameImage, saveImageToGallery, shareFile, deleteAllFiles } from '../utils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default GalleryStack = ({ navigation }) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [newName, setNewName] = useState('');

	const toast = useToast();

	return (
		<Stack.Navigator
			initialRouteName="Gallery"
			screenOptions={{
				headerStyle: {
					backgroundColor: '#e32f45',
				},
				headerTintColor: '#fff',
				headerTitleStyle: {
					fontWeight: 'bold',
				},
			}}
		>
			<Stack.Screen
				name="Gallery"
				component={GalleryScreen} />
			<Stack.Screen component={Detail}
				name="Detail"
				options={({ route }) => ({
					title: route.params.image.name ? route.params.image.name : 'Untitled',
					headerRight: () => (
						<>
							<Menu
								bgColor="white"
								shadow={2}
								defaultIsOpen={false} trigger={triggerProps => (
									<Pressable {...triggerProps} mr={2}>
										{({ isPressed }) =>
											<HamburgerIcon
												size="xl"
												color="white"
												opacity={isPressed ? 0.4 : 1}
											/>
										}
									</Pressable>
								)}>
								<Menu.Item
									onPress={async () => {
										saveImageToGallery(route.params.image.path, toast);
									}
									}
								>
									<Text>Save to mobile gallery</Text>
								</Menu.Item>
								<Menu.Item
									onPress={async () => {
										shareFile(route.params.image.path.replace('.png', '.svg'), toast);
									}
									}
								>
									<Text>Export as SVG</Text>
								</Menu.Item>

								<Menu.Item
									onPress={() => setModalVisible(true)}
								>
									<Text>Rename</Text>
								</Menu.Item>
								<Menu.Item
									onPress={async () => {
										await deleteFile(route.params.image.path);
										await deleteFile(route.params.image.path.replace('.png', '.svg'));
										await deleteFile(route.params.image.path.replace('.png', '.json'));
										navigation.goBack();
									}}
								>
									<Text color="red.500">Delete painting</Text>
								</Menu.Item>
							</Menu>

							<Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
								<Modal.Content>
									<Modal.CloseButton />
									<Modal.Header>Rename</Modal.Header>
									<Modal.Body>
										<Input
											placeholder="Enter new name"
											value={newName}
											onChangeText={setNewName}
											bgColor='white'
											_focus={{ borderColor: 'gray.400' }}
										/>
									</Modal.Body>
									<Modal.Footer>
										<Button
											borderWidth={0}
											size="sm"
											type="primary"
											bg="#50c878"
											_pressed={{ bg: "#50c878", opacity: 0.5 }}
											onPress={async () => {
												await renameImage(newName, route.params.image.path);
												setModalVisible(false);
												setNewName('');
												navigation.goBack();
											}}
											isDisabled={newName === ''}

										>
											<Text color="white">Save</Text>
										</Button>
									</Modal.Footer>
								</Modal.Content>
							</Modal>

						</>
					),
				})}
			/>
		</Stack.Navigator>
	);
}

function Detail({ route, navigation }) {
	const { image } = route.params;
	return (
		<Box flex={1} alignItems="center" justifyContent="center">
			<Image
				source={{ uri: 'data:image/png;base64,' + image.base64 }}
				alt="image"
				resizeMode="contain"
				height="100%"
				width="100%"
			/>
		</Box>
	);
}

function GalleryScreen({ route, navigation }) {
	const tabBarHeight = useBottomTabBarHeight();
	const [images, setImages] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);

	const getData = async () => {
		const filePaths = await getFiles();
		const imagesData = [];
		await Promise.all(filePaths.map(async (path) => {
			if (!path.includes('.png')) return;
			const {creationTime, name} = await getMetadata(path.replace('.png', '.json'));
			const base64 = await getImage(path);
			imagesData.push({ name: name, date: creationTime, base64: base64, path: path });
		}
		));
		imagesData.sort((a, b) => b.date - a.date);
		setImages(imagesData);
	}

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			getData();
			setIsLoaded(true);
		}
		);
		return unsubscribe;
	}, [navigation]);

	const NoImages = () => {
		return (
			<Box flex={1} alignItems="center" justifyContent="center">
				<Text fontSize="sm" mt={2} fontWeight="bold">Your Creative Journey Begins Here!</Text>
				<Text color="gray.600" fontSize="sm" mt={2} fontWeight="light"
					textAlign="center"
				>
					Looks like your gallery is as pristine as a blank canvas. No images yet! Fear not, every masterpiece begins
					with a single stroke. Capture the world around you, immortalize your moments, and watch your gallery come to life.
				</Text>
			</Box>
		);
	}


	return (
		<ScrollView flex={1} >
			<VStack space={4} alignItems="center" pb={tabBarHeight} pt={5}>
				<Flex direction="row" flexWrap="wrap" justifyContent="space-between" w="100%" pr={2} pl={2}>
					{!isLoaded && <Center flex={1}><Spinner color="red.500" /></Center>}
					{isLoaded && images.map((image, index) => {
						return <Pressable
							key={index}
							width="48%" height="auto" p={2} mb={5} borderRadius={10} bg={'white'} shadow={5}
							onPress={() => navigation.navigate('Detail', { image: image })}
						>
							{({ isPressed }) =>
								<Box opacity={isPressed ? 0.4 : 1}>
									<Image
										roundedTop="md"
										roundedBottom="md"
										source={{ uri: 'data:image/png;base64,' + image.base64 }}
										alt="image"
										resizeMode="cover"
										height={200}
										width="100%"
										borderColor={'gray.300'}
										borderWidth={1}
									/>
									<Text color="gray.600" fontSize="sm" mt={2} fontWeight="bold">{image.name ? image.name : 'Untitled'}</Text>
									<Text color="gray.600" fontSize="sm" mt={2} fontWeight="light">{showFormatedDate(image.date)}</Text>
									<Flex direction="row" alignItems="center" mt={2}>
										<Icon
											as={<MaterialCommunityIcons name="arrow-right" />}
											color="#e32f45"
											size="sm"
											mr={2}
										/>
										<Text color="#e32f45">
											Show detail
										</Text>
									</Flex>
								</Box>
							}
						</Pressable>
					})}
					{isLoaded && images.length === 0 && <NoImages />}
				</Flex>
			</VStack>
		</ScrollView>
	);
}